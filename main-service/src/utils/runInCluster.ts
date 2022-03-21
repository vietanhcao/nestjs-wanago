import * as _cluster from 'cluster';
const cluster = _cluster as unknown as _cluster.Cluster; // typings fix

import * as os from 'os';

export function runInCluster(bootstrap: () => Promise<void>) {
  const numberOfCores = os.cpus().length;
  if (cluster?.isMaster) {
    console.log(`MASTER SERVER (${process.pid}) IS RUNNING `);
    for (let i = 0; i < numberOfCores; ++i) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died`);
    });
  } else {
    bootstrap().then(() =>
      console.log('Service listening 👍: ', process.env.PORT),
    );
  }
}
