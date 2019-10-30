import os
import json
import sys
import random
import math

from gensim.models import Word2Vec
from nltk.cluster import KMeansClusterer, cosine_distance
import nltk
from sklearn.preprocessing import StandardScaler, normalize
from sklearn.manifold import TSNE
from sklearn import cluster
from sklearn import metrics
import numpy as np
import pandas as pd 


class Kmeans():

    """kmeans clustring for doc2vec vectors."""

    def __init__(self, k):
        self._dir_path = os.path.dirname(os.path.realpath(__file__))
        self.modelVocab = []
        self.modelVectors = []
        self.NUM_CLUSTERS = k
        self.new_coords = dict()
        self.new_coords['sequences'] = []
        pass

    def read_db(self):
        self.d2v_coords = json.load(open(os.path.join(self._dir_path, '..' , 'data', 'sequence_coords_doc2vec.json')))
        self.d2v_vectors = json.load(open(os.path.join(self._dir_path, '..' , 'data', 'sequence_vectors_doc2vec.json')))
        self.d2v_vectors = self.d2v_vectors['vectors']

        for i, vector in enumerate(self.d2v_vectors):
            self.modelVocab.append(vector)
            self.modelVectors.append(np.array(self.d2v_vectors[vector]))

        # Scaling the data to bring all the attributes to a comparable level 
        self.scaler = StandardScaler() 
        self.X_scaled = self.scaler.fit_transform(self.modelVectors) 

        # Normalizing the data so that  
        # the data approximately follows a Gaussian distribution 
        self.X_normalized = normalize(self.X_scaled) 

        # Converting the numpy array into a pandas DataFrame 
        self.X_normalized = pd.DataFrame(self.X_normalized) 
        
        self.tsne = TSNE(perplexity=40, n_components=2, init='pca', n_iter=2500, random_state=23)
        self.vectors = self.tsne.fit_transform(self.X_normalized) 
        self.vectors = pd.DataFrame(self.vectors) 
        self.vectors.columns = ['P1', 'P2'] 
        print(self.vectors.head())

    def kmeans(self):

        self.clusterer = KMeansClusterer(self.NUM_CLUSTERS, cosine_distance, repeats=10, avoid_empty_clusters=True)
        self.clusters = self.clusterer.cluster(self.vectors.values, True, trace=True)

        for i, promoter in enumerate(self.modelVocab):  
            print(promoter + ": " + str(self.clusters[i]))
            seq = next(seq for seq in self.d2v_coords['sequences'] if seq["promoter_id"] == str(promoter))
            seq['cluster_id'] = self.clusters[i]
            seq.update({"x_tsne": float(self.vectors['P1'][i])})
            seq.update({"y_tsne": float(self.vectors['P2'][i])})
            self.new_coords['sequences'].append(seq)


        self.kmeans = cluster.KMeans(n_clusters=self.NUM_CLUSTERS)
        self.kmeans.fit(np.array(self.modelVectors))

        self.labels = self.kmeans.labels_
        self.centroids = self.kmeans.cluster_centers_

        print("Score (Opposite of the value of X on the K-means objective which is Sum of distances of samples to their closest cluster center):")
        print(self.kmeans.score(np.array(self.modelVectors)))

    def saveData(self):

        with open(os.path.join(self._dir_path, '..', 'data','sequence_coords_doc2vec.json'), 'w') as filename: 
            json.dump(self.new_coords, filename, indent=4)
        
        print("sequence_coords_doc2vec.json is created")

def main():

    kmeans = Kmeans(55)
    kmeans.read_db()
    kmeans.kmeans()
    kmeans.saveData()


if __name__ == "__main__":
    main()