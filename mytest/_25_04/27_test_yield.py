def gen():
    task_id = 0
    int_value = 0
    char_value = "A"
    while True:
        # task_id 为 0 则 int_value +1，task_id 为 1 则 char_value +1
        match task_id:
            case 0:
                task_id = yield int_value  # 返回 int_value，并接收 send() 发送来的值给 task_id
                print(task_id)
                int_value += 1
            case 1:
                task_id = yield char_value  # 返回 char_value，并接收 send() 发送来的值给 task_id
                print(task_id)
                char_value = chr(ord(char_value) + 1)
            case _:
                task_id = yield  # 返回 None
                print(task_id)

g = gen()
print("-------------------1----------------------")
print(g.send(None))  # 0
print("-------------------2----------------------")

print(next(g))  # 0
print("-------------------3----------------------")

print(next(g))  # 0
print("-------------------4----------------------")

print(g.send(1))  # A
print("-------------------5----------------------")

print(g.send(0))  # 1
print("-------------------6----------------------")

print(g.send(1))  # B
print("-------------------7----------------------")

print(g.send(0))  # 2
print("-------------------8----------------------")



print(ord('中'))  # 输出 20013，中文字符“中”的 Unicode 码点
print(chr(ord('中') + 1))  # 输出 20013，中文字符“中”的 Unicode 码点
print(chr(ord('中') + 2))  # 输出 20013，中文字符“中”的 Unicode 码点
print(chr(ord('中') + 3))  # 输出 20013，中文字符“中”的 Unicode 码点



if __name__ == '__main__':
    pass