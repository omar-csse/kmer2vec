import os
import json
import random
import math
import logging
import shutil
import collections
from array import array
import time
from datetime import datetime

import multiprocessing as mp
from multiprocessing import Queue, Manager, Pool, Lock, Array

import tensorflow as tf
from tensorflow.contrib.tensorboard.plugins import projector

import numpy as np


class Kmer2vec(object):

    """kmer2vec model (skipgram)."""


    def __init__(self, embedding_size, batch_size, learningRate, window_size):

        self._inputs = []
        self._labels = []
        self._average = 0.0
        self._data = []
        self._kmer2int = {}
        self._int2kmer = {}
        self._kmers_size = 0
        self._embedding_size = embedding_size
        self._batch_size = batch_size
        self._num_sampled = 8
        self._learningRate = learningRate
        self._window_size = window_size
        self._average_loss = 0.0
        self._data_index = 0
        self._graph = None
        self._train_inputs = None
        self._train_labels = None
        self._embeddings = None
        self._optimizer = None
        self._merged = None
        self._loss = None
        self._log_file = None
        self.__valid_size = 16  # Random set of words to evaluate similarity on.
        self.__valid_window = 100  # Only pick dev samples in the head of the distribution.
        self._valid_examples = np.random.choice(self.__valid_window, self.__valid_size, replace=False)
        self._similarity = None
        self._normalized_embeddings = None
        self._final_embeddings = None
        self._tensorboard_path = None
        self._dir_path = os.path.dirname(os.path.realpath(__file__))


    def _cleanDirectories(self, clean_logs=False):

        if os.path.exists(self._dir_path + '/log.txt'):
            os.remove(self._dir_path + '/log.txt')

        if (clean_logs):
            shutil.rmtree(self._dir_path + '/logs', ignore_errors=True)

    
    def openLogs(self):

        self._cleanDirectories()

        now = datetime.now()

        version = now.strftime("%m %d %Y-%H:%M:%S")
        self._tensorboard_path = self._dir_path+'/logs/lr'+str(self._learningRate)+'-ws:'+str(self._window_size)+'-kmer2vec '+version
        os.makedirs(self._tensorboard_path)

        self._log_file = open(self._tensorboard_path + '/log.txt', 'a')
        return self._log_file


    def closeLogs(self):
        self._log_file.close()


    def setup(self):
        
        # restrict the logging information to errors only. Tensorflow shows many warinings
        # for the newr versions of used functions
        logging.getLogger("tensorflow").setLevel(logging.ERROR)

        print("\n\nTensorFlow version: " + tf.__version__)
        self._log_file.write("\n\nTensorFlow version: " + tf.__version__ + "\n\n")
        self._log_file.write("""kmer2vec model (skipgram).""")
        self._log_file.write("\n\nimplementing word2vec algorithm on promotors' sequences \nwith sigma70 factor using skip gram model\n\n")
        self._log_file.write("Hyper-parameters:\n\nbatch_size: {}, embedding_size: {}, learning_rate: {}, window_size: {}".format(self._batch_size, self._embedding_size, self._learningRate, self._window_size))

        # the collected data and labels
        self._data = json.load(open(self._dir_path + '/data/data.json'))
        self._kmer2int = json.load(open(self._dir_path + '/data/kmer2int.json'))
        self._int2kmer = json.load(open(self._dir_path + '/data/int2kmer.json'))
        self._kmers_size = len(self._kmer2int)

        print("\nML Data setup is done\n")
        self._log_file.write("\n\nML Data setup is done\n")


    def getInputData(self):
        return self._inputs


    def getLabelData(self):
        return self._labels


    def getInputDataIndx(self, index):
        return self._inputs[index]


    def getLabelDataIndx(self, index):
        return self._labels[index]

    
    def _tensorboardProjector(self):

        # Write corresponding labels for the embeddings.
        with open(self._tensorboard_path + '/metadata.tsv', 'w') as f:

            for kmer in self._kmer2int.keys():
                f.write(kmer + '\n')

        # Create a configuration for visualizing embeddings with the labels in
        # TensorBoard.
        config = projector.ProjectorConfig()
        embedding_conf = config.embeddings.add()
        embedding_conf.tensor_name = self._embeddings.name
        embedding_conf.metadata_path = os.path.join(self._tensorboard_path, 'metadata.tsv')

        return config


    def _get_skipgram_batch(self, skip_window=4, num_skips=8):
        
        assert self._batch_size % num_skips == 0
        assert num_skips <= 2 * skip_window

        batch = np.ndarray(shape=(self._batch_size), dtype=np.int32)
        labels = np.ndarray(shape=(self._batch_size, 1), dtype=np.int32)

        span = 2 * skip_window + 1  # [ skip_window target skip_window ]
        buffer = collections.deque(maxlen=span)  # pylint: disable=redefined-builtin

        if self._data_index + span > len(self._data):
            self._data_index = 0

        buffer.extend(self._data[self._data_index: self._data_index + span])
        self._data_index += span

        for i in range(self._batch_size // num_skips):

            context_words = [w for w in range(span) if w != skip_window]
            words_to_use = random.sample(context_words, num_skips)

            for j, context_word in enumerate(words_to_use):

                batch[i * num_skips + j] = buffer[skip_window]
                labels[i * num_skips + j, 0] = buffer[context_word]

            if self._data_index == len(self._data):
                buffer.extend(self._data[0:span])
                self._data_index = span
            else:
                buffer.append(self._data[self._data_index])
                self._data_index += 1

        # Backtrack a little bit to avoid skipping words in the end of a batch
        self._data_index = (self._data_index + len(self._data) - span) % len(self._data)

        return batch, labels


    def _build_graph(self):	

        # use tensorflow graph to visualize the dataflow of the model using tensorboard.
        self._graph = tf.Graph()

        with self._graph.as_default():

            with tf.name_scope('inputs'):
                # Placeholders for inputs
                self._train_inputs = tf.placeholder(tf.int32, shape=[self._batch_size])
                self._train_labels = tf.placeholder(tf.int32, shape=[self._batch_size, 1])
                valid_dataset = tf.constant(self._valid_examples, dtype=tf.int32)

            with tf.name_scope('embedding'):
                self._embeddings = tf.Variable(tf.random_uniform([self._kmers_size, self._embedding_size], -1.0, 1.0))
                embed = tf.nn.embedding_lookup(self._embeddings, self._train_inputs)

            with tf.name_scope('nce_weights'):
                softmax_weights = tf.Variable(tf.truncated_normal([self._kmers_size, self._embedding_size], 
                                    stddev=1.0 / math.sqrt(self._embedding_size)))

            with tf.name_scope('nce_biases'):
                softmax_biases = tf.Variable(tf.zeros([self._kmers_size]))

            # Compute the softmax loss, using a sample of the negative labels each time.
            with tf.name_scope('loss'):
                self._loss = tf.reduce_mean(tf.nn.sampled_softmax_loss(weights=softmax_weights, 
                                        biases=softmax_biases, labels=self._train_labels, inputs=embed, 
                                        num_sampled=self._num_sampled, num_classes=self._kmers_size))

            # Add the loss value as a scalar to summary.
            tf.summary.scalar('loss', self._loss)

            # We use the Adam optimizer.
            with tf.name_scope('optimizer'):
                self._optimizer = tf.train.GradientDescentOptimizer(self._learningRate).minimize(self._loss)

            # Compute the cosine similarity between minibatch examples and all
            # embeddings.
            norm = tf.sqrt(tf.reduce_sum(tf.square(self._embeddings), 1, keepdims=True))
            self._normalized_embeddings = self._embeddings / norm

            valid_embeddings = tf.nn.embedding_lookup(self._normalized_embeddings, valid_dataset)

            self._similarity = tf.matmul(valid_embeddings, self._normalized_embeddings, transpose_b=True)

            # Merge all summaries.
            self._merged = tf.summary.merge_all()
            
            # We must initialize all variables before we use them.
            # Add variable initializer.
            self._variables = tf.global_variables_initializer()


    def train(self, epochs):

        self._build_graph()

        print('\nGraph Initialized')
        self._log_file.write('\nGraph Initialized\n')

        with tf.Session(graph=self._graph) as session:
            
            train_writer = tf.summary.FileWriter(self._tensorboard_path, session.graph)

            self._variables.run()
            
            print('Variables Initialized')
            self._log_file.write('Variables Initialized\n')
            print('Session Initialized\n\n\n')
            self._log_file.write('Session Initialized\n\n\n')
            
            average_loss_2000_logs = []
            average_loss_2000 = 0

            for epoch in range(1, epochs):

                # generate a batch using a dataset pipeline
                batch_inputs, batch_labels = self._get_skipgram_batch(skip_window=self._window_size, num_skips=self._window_size*2)

                # Put the data as a dictionery (the model accept dict only)
                feed_dict = {self._train_inputs: batch_inputs, self._train_labels: batch_labels}

                # Define metadata variable.
                run_metadata = tf.RunMetadata()

                # run the model
                _ , summary, loss_val = session.run([self._optimizer, self._merged, self._loss], 
                                                    feed_dict=feed_dict, run_metadata=run_metadata)

                # keep tracking the average loss of the model
                self._average_loss += loss_val
                average_loss_2000 += loss_val

                # Add returned summaries to writer in each step.
                train_writer.add_summary(summary, epoch)
                # Add returned summaries to writer in each step.
                # Add metadata to visualize the graph for the last run.
                if epoch == (epochs - 1):
                    train_writer.add_run_metadata(run_metadata, 'epoch: %d' % epoch)

                # The average loss is an estimate of the loss over the last 2000
                # batches.
                self._log_file.write('Average loss at epoch:  {}/{}    =>   {}\n'.format(epoch, epochs, (self._average_loss/epoch)))
                print('Average loss at epoch:  {}/{}    =>   {}'.format(epoch, epochs, (self._average_loss/epoch)))

                if epoch % 2000 == 0:
                    if epoch > 0:
                        average_loss_2000 /= 2000
                    # The average loss is an estimate of the loss over the last 2000
                    # batches.
                    average_loss_2000_logs.append({'epoch':epoch, 'average_loss_2000': average_loss_2000})
                    average_loss_2000 = 0

            print('\n\n\n')
            self._log_file.write('\n\n\n')

            for avg in average_loss_2000_logs:

                epoch = avg['epoch']
                average_loss_2000 = avg['average_loss_2000']

                self._log_file.write('Average loss every 2000 epochs, at epoch:  {}/{}    =>   {}\n'.format(epoch, epochs, (average_loss_2000/epoch)))
                print('Average loss every 2000 epochs, at epoch:  {}/{}    =>   {}'.format(epoch, epochs, (average_loss_2000/epoch)))

            # Add ops to save and restore all the variables.
            saver = tf.train.Saver()
            save_path = saver.save(session, self._tensorboard_path + "/model.ckpt")

            # Returns our Embeddings so we can access them       
            self._final_embeddings = self._normalized_embeddings.eval()


            config = self._tensorboardProjector()
            projector.visualize_embeddings(train_writer, config)

            print("\n\n\nModel saved in path: %s" % save_path)
            self._log_file.write("\n\n\nModel saved in path: %s" % save_path)


def main():

    kmer2vec = Kmer2vec(embedding_size=256, batch_size=64, learningRate=1, window_size=4)

    logs_file = kmer2vec.openLogs()

    kmer2vec.setup()
    kmer2vec.train(epochs=50000)

    print("\n\n\nnumber of cpus: {}".format(mp.cpu_count()))
    logs_file.write("\n\n\nnumber of cpus: {}".format(mp.cpu_count()))

    print('\nkmer size (vocabulary = unique words): %d\n' % kmer2vec._kmers_size)
    logs_file.write('\nkmer size (vocabulary = unique words): %d\n' % kmer2vec._kmers_size)

    print('length of data: %d\n' % len(kmer2vec._data))
    logs_file.write('length of data: %d' % len(kmer2vec._data))

    print('\n\ntraining is done!, and model is saved.\n')
    logs_file.write('\n\ntraining is done!, and model is saved.\n')
    
    kmer2vec.closeLogs()


if __name__ == "__main__":
    main()