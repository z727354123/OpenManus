def linear(a, b):
    def inner(x):
        return a * x + b

    print(id(a))
    print(a.__repr__())
    print(id(b))
    return inner

y1 = linear(1, 2)
objects = y1.__closure__
print(objects)
print(objects[0].cell_contents)  # 1
print(objects[1].cell_contents)  # 2



if __name__ == '__main__':
    pass