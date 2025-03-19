import argparse
import asyncio
import atexit
import json
import logging
import os
import sys
from inspect import Parameter, Signature
from typing import Any, Optional

from mcp.server.fastmcp import FastMCP


# Add directories to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(parent_dir)
sys.path.insert(0, parent_dir)
sys.path.insert(0, current_dir)
sys.path.insert(0, root_dir)

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("mcp-server")

from app.tool.base import BaseTool
from app.tool.bash import Bash

# Import OpenManus tools
from app.tool.browser_use_tool import BrowserUseTool
from app.tool.str_replace_editor import StrReplaceEditor
from app.tool.terminate import Terminate


# Initialize FastMCP server
openmanus = FastMCP("openmanus")

# Initialize tool instances
bash_tool = Bash()
browser_tool = BrowserUseTool()
str_replace_editor_tool = StrReplaceEditor()
terminate_tool = Terminate()


def register_tool(tool: BaseTool, method_name: Optional[str] = None) -> None:
    """Register a tool with the OpenManus server.

    Args:
        tool: The tool instance to register
        method_name: Optional custom name for the tool method
    """
    tool_name = method_name or tool.name

    # Get tool information using its own methods
    tool_param = tool.to_param()
    tool_function = tool_param["function"]

    # Define the async function to be registered
    async def tool_method(**kwargs):
        logger.info(f"Executing {tool_name}: {kwargs}")
        result = await tool.execute(**kwargs)

        # Handle different types of results
        if hasattr(result, "model_dump"):
            return json.dumps(result.model_dump())
        elif isinstance(result, dict):
            return json.dumps(result)
        return result

    # Set the function name
    tool_method.__name__ = tool_name

    # Set the function docstring
    description = tool_function.get("description", "")
    param_props = tool_function.get("parameters", {}).get("properties", {})
    required_params = tool_function.get("parameters", {}).get("required", [])

    # Build a proper docstring with parameter descriptions
    docstring = description

    # Create parameter list separately for the signature
    parameters = []

    # Add parameters to both docstring and signature
    if param_props:
        docstring += "\n\nParameters:\n"
        for param_name, param_details in param_props.items():
            required_str = (
                "(required)" if param_name in required_params else "(optional)"
            )
            param_type = param_details.get("type", "any")
            param_desc = param_details.get("description", "")

            # Add to docstring
            docstring += (
                f"    {param_name} ({param_type}) {required_str}: {param_desc}\n"
            )

            # Create parameter for signature
            default = Parameter.empty if param_name in required_params else None
            annotation = Any

            # Try to get a better type annotation based on the parameter type
            if param_type == "string":
                annotation = str
            elif param_type == "integer":
                annotation = int
            elif param_type == "number":
                annotation = float
            elif param_type == "boolean":
                annotation = bool
            elif param_type == "object":
                annotation = dict
            elif param_type == "array":
                annotation = list

            # Create parameter
            param = Parameter(
                name=param_name,
                kind=Parameter.KEYWORD_ONLY,
                default=default,
                annotation=annotation,
            )
            parameters.append(param)

    # Store the full docstring
    tool_method.__doc__ = docstring

    # Create and set the signature
    tool_method.__signature__ = Signature(parameters=parameters)

    # Store the complete parameter schema for tools that need to access it programmatically
    tool_method._parameter_schema = {
        param_name: {
            "description": param_details.get("description", ""),
            "type": param_details.get("type", "any"),
            "required": param_name in required_params,
        }
        for param_name, param_details in param_props.items()
    }

    # Register the tool with FastMCP
    openmanus.tool()(tool_method)
    logger.info(f"Registered tool: {tool_name}")


# Register all tools
register_tool(bash_tool)
register_tool(browser_tool)
register_tool(str_replace_editor_tool)
register_tool(terminate_tool)


# Clean up resources
async def cleanup():
    """Clean up all tool resources"""
    logger.info("Cleaning up resources")
    await browser_tool.cleanup()


# Register cleanup function
atexit.register(lambda: asyncio.run(cleanup()))


def parse_args():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description="OpenManus MCP Server")
    parser.add_argument(
        "--transport",
        choices=["stdio"],
        default="stdio",
        help="Communication method: stdio or http (default: stdio)",
    )
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    logger.info("Starting OpenManus server (stdio mode)")
    openmanus.run(transport="stdio")
