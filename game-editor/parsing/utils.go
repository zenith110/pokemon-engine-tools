package parsing

import (
	"encoding/base64"
	"os"
)

func toBase64(byte []byte) string {
	return base64.StdEncoding.EncodeToString(byte)
}

func CreateBase64File(file string) string {
	bytes, _ := os.ReadFile(file)
	var base64String string
	base64String += toBase64(bytes)
	return base64String
}
