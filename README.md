# kmer2vec model

This is a project to find the relation between different DNA kmers of the promotors with sigma70 factor from [**regulonDB**](https://github.com/omar-csse/kmer2vec/tree/master/db). Each DNA sequence is divided into kmers of length 6. Tensorboard is used to visualize the prediction of the model. Also, to visualize the nearest **kmers** in 3D  

#


### Prerequisites:

- Python 3.x and pip
- Node.js
- npm
- tensorflow

#

To download TensorFlow run the following command in the terminal:


```bash 
    pip install tensorflow
```
  
&nbsp;

#

To change the hyperparameters of the kmer2vec model, navigate to line 323 in [kmer2vec.py](https://github.com/omar-csse/kmer2vec/blob/master/lib/kmer2vec.py) and change the following parameters as wanted.

```python
    kmer2vec = Kmer2vec(embedding_size=128, batch_size=128, num_sampled=16, learningRate=1, window_size=2)

```
&nbsp;

#

&nbsp;

After installing the Prerequisites, navigate to the kmer2vec folder and run the project with the following commands:


To train the model:

```bash 
    npm run train
```

&nbsp;

The following files will run in this order:
- [sigma70.py](https://github.com/omar-csse/kmer2vec/blob/master/lib/sigma70.py)&emsp;&emsp;to generate &emsp;=>&emsp;[sigma70.json](https://github.com/omar-csse/kmer2vec/blob/master/lib/data/sigma70.json)&nbsp;&nbsp;

&nbsp;  
- [data.py](https://github.com/omar-csse/kmer2vec/blob/master/lib/data.py)&emsp;&emsp;&emsp;&ensp;&nbsp;to generate &emsp;=>&emsp;[corpus.json](https://github.com/omar-csse/kmer2vec/blob/master/lib/data/corpus.json), [data.json](https://github.com/omar-csse/kmer2vec/blob/master/lib/data/data.json), [corpus.json](https://github.com/omar-csse/kmer2vec/blob/master/lib/data/corpus.json), [int2kmer.json](https://github.com/omar-csse/kmer2vec/blob/master/lib/data/int2kmer.json), [kmer2int.json](https://github.com/omar-csse/kmer2vec/blob/master/lib/data/kmer2int.json), [kmers.json](https://github.com/omar-csse/kmer2vec/blob/master/lib/data/kmers.json), [sequences.json](https://github.com/omar-csse/kmer2vec/blob/master/lib/data/sequences.json)&nbsp;&nbsp;

&nbsp; 
- [kmer2vec.py](https://github.com/omar-csse/kmer2vec/blob/master/lib/kmer2vec.py)&emsp;&nbsp;to run the model 

&nbsp;

After running the model a [**data**](https://github.com/omar-csse/kmer2vec/tree/master/lib/data) folder inside [**lib**](https://github.com/omar-csse/kmer2vec/tree/master/lib) with the filtered regulonDB data will be generated in json files.

Also, a [**log.txt**](https://github.com/omar-csse/kmer2vec/tree/master/lib/logs/log.txt) file will be generated to check the output of the current trained model. It will be added inside the model [**logs**](https://github.com/omar-csse/kmer2vec/tree/master/lib/logs) folder. Note that the [**logs**](https://github.com/omar-csse/kmer2vec/tree/master/lib/logs) folder is the output of **Tensorflow**. So, each time training a model, a unique folder with timestamp inside the [**logs**](https://github.com/omar-csse/kmer2vec/tree/master/lib/logs) folder will be generated and can be visualized in **Tensorboard**.
 
&nbsp;

To visualize the project with **Tensorboard** run the following command, make sure to navigate to kmer2vec folder.

```bash 
    npm run visualize
```
&nbsp;

You will get a URL in the response, usually, the port is **6006**. So most likely you need to navigate to the following URL:

> TensorBoard 1.13.1 at [http://localhost:6006](http://localhost:6006/)

&nbsp;

Finally, you will have three tabs:

- Scalars
- Graphs
- Projector

&nbsp;

To visualize the loss of the model in 2D graphs, navigate to **SCALARS**

To visualize the graph of the model, navigate to **GRAPHS**

To visualize the nearest kmers in 3D, navigate to **Projector**