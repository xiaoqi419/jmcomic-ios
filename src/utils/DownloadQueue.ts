// DownloadQueue — iOS NSURLSession 并发下载串行化
// 解决 Code=-3000 "Cannot create file" 问题
// @author Jason

type Task<T> = () => Promise<T>;

class DownloadQueue {
  private maxConcurrent: number;
  private running = 0;
  private queue: Array<{ task: Task<any>; resolve: (v: any) => void; reject: (e: any) => void }> = [];

  constructor(maxConcurrent = 2) {
    this.maxConcurrent = maxConcurrent;
  }

  enqueue<T>(task: Task<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this.drain();
    });
  }

  private drain() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const item = this.queue.shift()!;
      this.running++;
      item.task()
        .then(v => { this.running--; item.resolve(v); this.drain(); })
        .catch(e => { this.running--; item.reject(e); this.drain(); });
    }
  }
}

export const downloadQueue = new DownloadQueue(2);
