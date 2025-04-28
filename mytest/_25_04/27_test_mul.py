from multiprocessing import Process
import os
import threading

def worker():
    print("子进程，PID:", os.getpid())
    # 怎么获取父进程的PID
    print("子进程 的 父进程，PID:", os.getppid())

if __name__ == "__main__":
    print("父进程，PID:", os.getpid())
    p = Process(target=worker)
    p.start()
    p.join()
    # 获取当前线程 是否 守护线程
    print("当前线程 是否 守护线程:", p.daemon)
    # 父线程 是否 守护线程
    current_thread = threading.current_thread()
    print("是否守护线程:", current_thread.daemon)
    print("PID:", current_thread.ident)





