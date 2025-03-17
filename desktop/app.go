package main

import (
	"OpenManus/src/utils"
	"context"
	"fmt"
)

// App struct
type App struct {
	ctx context.Context
}

type File struct {
	Result     string `json:"result"`
	Error      string `json:"error"`
	Callbackid string `json:"callbackid"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

// ReadAll reads file content
func (a *App) ReadAll(filePath string) string {
	// 读取文件内容,得到一个含文件内容和callbackid的json字符串
	data := string(utils.ReadAll(filePath))
	utils.Log("ReadAll data: ", data)
	return data
}
