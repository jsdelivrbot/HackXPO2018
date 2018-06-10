class A:
    def _single_method(self):
        pass
    def __double_method(self): # for mangling
        pass

class B(A):
    def __double_method(self): # for mangling
        print("Hello")
        pass

n=  B()
n._B__double_method();