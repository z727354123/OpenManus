package utils

import (
	"fmt"
	"io"
	"os"
)

// 打开文件
func ReadAll(filePath string) []byte {
	if IsBlank(filePath) {
		fmt.Println("File path is nil")
		return nil
	}
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return nil
	}
	// 确保文件最后被关闭
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		fmt.Println("Read file error:", err)
		return nil
	}
	return data
}
