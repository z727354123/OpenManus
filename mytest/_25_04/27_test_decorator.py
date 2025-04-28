import time
import functools

def timer1(func):
    print("-------------------timer1----------------------")
    @functools.wraps(func)  # 保留原函数的元数据
    def wrapper(*args, **kwargs):
        print(f"timer1 start")
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"timer1 函数 {func.__name__} 执行时间: {end_time - start_time:.4f} 秒")
        return result
    return wrapper

def timer2(func):
    print("-------------------timer2----------------------")
    @functools.wraps(func)  # 保留原函数的元数据
    def wrapper(*args, **kwargs):
        print(f"timer2 start")
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        print(f"timer2 函数 {func.__name__} 执行时间: {end_time - start_time:.4f} 秒")
        return result
    return wrapper

@timer1
@timer2
def slow_function():
    time.sleep(1)  # 模拟耗时操作
    return "操作完成"


print("-------------------华丽分割线----------------------")
# 调用函数
slow_function()




def decorator1(func):
    def wrapper(*args, **kwargs):
        print("Decorator 1 - Before")
        result = func(*args, **kwargs)
        print("Decorator 1 - After")
        return result
    return wrapper

def decorator2(func):
    def wrapper(*args, **kwargs):
        print("Decorator 2 - Before")
        result = func(*args, **kwargs)
        print("Decorator 2 - After")
        return result
    return wrapper

@decorator1
@decorator2
def say_hello():
    print("Hello!")

say_hello()


def say_hello2():
    print("Hello!")

testFun = decorator1(decorator2(say_hello2))
testFun()


if __name__ == '__main__':
    pass