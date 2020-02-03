import os
import json
import sys
import random
import math

from gensim.models import Word2Vec
from nltk.cluster import KMeansClusterer, cosine_distance
import nltk
from sklearn import cluster
from sklearn import metrics
from sklearn.preprocessing import StandardScaler, normalize
from sklearn.manifold import TSNE
import numpy as np
import pandas as pd 


class Kmeans():

    """kmeans clustring for word2vec vectors."""

    def __init__(self, k):
        self._dir_path = os.path.dirname(os.path.realpath(__file__))
        self.modelVocab = []
        self.modelVectors = []
        self.NUM_CLUSTERS = k
        self.new_coords = dict()
        self.new_coords['sequences'] = []
        self.vectors = []
        pass

    def read_db(self):
        self.w2v_coords = json.load(open(os.path.join(self._dir_path, '..' , 'data', 'sequence_coords.json')))
        self.w2v_vectors = json.load(open(os.path.join(self._dir_path, '..' , 'data', 'sequence_vectors.json')))
        self.w2v_vectors = self.w2v_vectors['vectors']

        for i, vector in enumerate(self.w2v_vectors):
            self.modelVocab.append(vector)
            self.modelVectors.append(np.array(self.w2v_vectors[vector]))
            self.vectors.append([self.w2v_coords['sequences'][i]['x'], self.w2v_coords['sequences'][i]['y']])
        
        self.vectors = np.asarray(self.vectors, dtype=np.float32)

    def kmeans(self):

        self.clusterer = KMeansClusterer(self.NUM_CLUSTERS, cosine_distance, repeats=10, avoid_empty_clusters=True)
        self.clusters = self.clusterer.cluster(self.vectors, True, trace=True)

        for i, promoter in enumerate(self.modelVocab):  
            print(promoter + ": " + str(self.clusters[i]))
            seq = next(seq for seq in self.w2v_coords['sequences'] if seq["promoter_id"] == str(promoter))
            seq['cluster_id'] = self.clusters[i]
            self.new_coords['sequences'].append(seq)

    def saveData(self):

        with open(os.path.join(self._dir_path, '..', 'data','sequence_coords.json'), 'w') as filename: 
            json.dump(self.new_coords, filename, indent=4)
        
        print("sequence_coords.json is created")

def main():

    kmeans = Kmeans(93)
    kmeans.read_db()
    kmeans.kmeans()
    kmeans.saveData()


if __name__ == "__main__":
    main()