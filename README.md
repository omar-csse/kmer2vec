# kmer2vec model

This is a project to find the relation between different DNA kmers of the promotors with sigma70 factor from regulonDB. Each DNA sequence is divided into kmers of length 6. Tensorboard is used to visualize the prediction of the model. Also, to visualize the nearest **kmers** in 3D  

#


### Prerequests:

- Python 3.x and pip
- Node.js
- npm
- tensorflow

#

To download TensorFlow run the following command in the terminal:

&nbsp;

> pip install tensorflow
  
&nbsp;

#

After installing the pre-requests, navigate to the kmer2vec folder and run the project with the following commands:


To train the model:

> npm run train

After running the model a data folder inside **lib** with the filtered regulonDB data will be generated in json files.

Also, a log.txt file will be generated to check the logs of **kmer2vec.py**. Note that the **logs** folder is for the output of **Tensorflow**. So, each time training a model, a unique folder with timestamp inside the **logs** folder will be generated and can be visualized in **Tensorboard**.
 
&nbsp;

To visualize the project with **Tensorboard** run the following command, make sure to navigate to kmer2vec folder.

> npm run visualize

You will get a URL in the response, usually, the port is **6006**. So most likely you need to navigate to the following URL:

> [TensorBoard 1.13.1 at http://localhost:6006](http://localhost:6006/)


Finally, you will have three tabs:

- Scalars
- Graphs
- Projector

&nbsp;

To visualize the loss of the model in 2D graphs, navigate to **SCALARS**

To visualize the graph of the model, navigate to **GRAPHS**

To visualize the nearest kmers in 3D, navigate to **Projector**