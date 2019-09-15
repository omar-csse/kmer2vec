import os
import json
import sys
import shutil
import time
from datetime import datetime

import multiprocessing

from gensim.models.doc2vec import Doc2Vec, TaggedDocument
import nltk
from nltk.tokenize import word_tokenize
import numpy as np

nltk.download('punkt')
np.set_printoptions(threshold=sys.maxsize)


class D2V(object):

    """Doc2Vec model."""


    def __init__(self, embedding_size=256, learningRate=0.025, window_size=8):

        self._corpus = []
        self._sigma70 = []
        self.tagged_data = None
        self._embedding_size = embedding_size
        self._learningRate = learningRate
        self._window_size = window_size
        self._log_file = None
        self._workers = multiprocessing.cpu_count()
        self._dir_path = os.path.dirname(os.path.realpath(__file__))
        self.model = None


    def _cleanDirectories(self, clean_logs=False):

        if os.path.exists(self._dir_path + '/log.txt'):
            os.remove(self._dir_path + '/log.txt')

        if (clean_logs):
            shutil.rmtree(self._dir_path + '/logs', ignore_errors=True)

    
    def openLogs(self):

        self._cleanDirectories()

        now = datetime.now()

        version = now.strftime("%m %d %Y-%H:%M:%S")
        self._logs_path = self._dir_path+'/logs/lr'+str(self._learningRate)+'-ws:'+str(self._window_size)+'-doc2vec '+version
        os.makedirs(self._logs_path)

        self._log_file = open(self._logs_path + '/log.txt', 'a')
        return self._log_file


    def closeLogs(self):
        self._log_file.close()


    def setup(self):

        self._log_file.write("""Doc2vec model (skipgram).""")
        self._log_file.write("\n\nimplementing doc2vec algorithm on promotors' sequences \nwith sigma70 factor\n\n")
        self._log_file.write("Hyper-parameters:\n\nembedding_size: {}, learning_rate: {}, window_size: {}".format(self._embedding_size, self._learningRate, self._window_size))

        # the collected data and labels
        self._corpus = json.load(open(self._dir_path + '/../data/corpus.json'))
        self._sigma70 = json.load(open(self._dir_path + '/../data/sigma70.json'))

        self.tagged_data = [TaggedDocument(words=seq, tags=[self._sigma70[i]['PROMOTER_ID']]) for i, seq in enumerate(self._corpus)]

        print("\nML Data setup is done\n")
        self._log_file.write("\n\nML Data setup is done\n")


    def build_model(self):
        self.model = Doc2Vec(self.tagged_data, dm=1, vector_size=self._embedding_size,
                               min_alpha=0.00025, alpha=self._learningRate, workers=self._workers,
                               window=self._window_size)


    def calc_loss(self):
        print(self.model.get_latest_training_loss())


    def train(self, epochs):
        print("\nTraining in progress...\n\n")
        self._log_file.write("\nTraining in progress...\n\n")
        for epoch in range(epochs):
            print('iteration {0}'.format(epoch))
            self._log_file.write('iteration {0}\n'.format(epoch))
            self.model.train(self.tagged_data, total_examples=self.model.corpus_count, epochs=self.model.epochs)
            self.model.alpha -= 0.0002 # decrease the learning rate
            self.model.min_alpha = self.model.alpha # fix the learning rate, no decay    


    def save(self):

        self.model.save(self._logs_path + "/doc2vec.model")

        self.model = Doc2Vec.load(self._logs_path + "/doc2vec.model")
        similar = self.model.docvecs.most_similar('ECK125136994')

        print("\n\n\nsimilar_words(ECK125136994)\n\n")
        print(similar)
        self._log_file.write("\n\n\nsimilar_words(ECK125136994)\n\n")
        self._log_file.write(str(similar))

        vectors = dict()
        vectors['vectors'] = {}
            
        for i, seq in enumerate(self._corpus):
            sequence = str(self._sigma70[i]['PROMOTER_ID'])
            vectors['vectors'].update( {sequence: self.model[sequence].tolist()} )
            
        with open(self._dir_path+'/../data/sequence_vectors_doc2vec.json', 'w') as filename: json.dump(vectors, filename, indent=4)

        self._log_file.write("\n\n")
        print('\n\n')


def main():

    doc2vec = D2V(embedding_size=256, learningRate=0.025, window_size=8)

    logs_file = doc2vec.openLogs()

    doc2vec.setup()
    doc2vec.build_model()
    doc2vec.train(epochs=50)
    doc2vec.save()

    print("\nnumber of cpus: {}".format(multiprocessing.cpu_count()))
    logs_file.write("\n\n\nnumber of cpus: {}".format(multiprocessing.cpu_count()))

    print('\n\ntraining is done!, and model is saved.\n')
    logs_file.write('\n\ntraining is done!, and model is saved.\n')
    
    doc2vec.closeLogs()


if __name__ == "__main__":
    main()