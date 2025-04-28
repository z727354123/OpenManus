

from collections.abc import Iterator

print(isinstance([], Iterator)) # False
print(isinstance(iter([]), Iterator)) # True
print(isinstance((), Iterator)) # False
print(isinstance(iter(()), Iterator)) # True
print(isinstance(set(), Iterator)) # False
print(isinstance(iter(set()), Iterator)) # True

print(isinstance({}, Iterator)) # False
print(isinstance(iter({}), Iterator)) # True

print("-------------------华丽分割线----------------------")
print(isinstance("100", Iterator)) # False
print(isinstance(iter("100"), Iterator)) # True

print(isinstance((x for x in range(10)), Iterator)) # True
print(isinstance(iter((x for x in range(10))), Iterator)) # False


# 如果想判断生成器是否是迭代器
gen = (x for x in range(10))
print(isinstance(gen, Iterator))

# 或者如果想获取生成器的迭代器(其实生成器本身就是迭代器)
gen = (x for x in range(10))
print(id(gen))
iterator = iter(gen)
print(id(iterator))

print(isinstance(iterator, Iterator))


if __name__ == '__main__':
    pass