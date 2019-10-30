import os
import json
import sys
import random
import math

import numpy as np 
import pandas as pd 
import matplotlib.pyplot as plt 
  
from sklearn.cluster import DBSCAN 
from sklearn import metrics
from sklearn.preprocessing import StandardScaler 
from sklearn.preprocessing import normalize 
from sklearn.manifold import TSNE
import matplotlib.pyplot as plt


class DBSCAN_CLS():

    """dbscan clustring for word2vec vectors."""

    def __init__(self):
        self._dir_path = os.path.dirname(os.path.realpath(__file__))
        self.modelVocab = []
        self.modelVectors = []
        self.new_coords = dict()
        self.new_coords['sequences'] = []

    def read_vectors(self):
        self.w2v_coords = json.load(open(os.path.join(self._dir_path, '..' , 'data', 'sequence_coords.json')))
        self.w2v_vectors = json.load(open(os.path.join(self._dir_path, '..' , 'data', 'sequence_vectors.json')))
        self.w2v_vectors = self.w2v_vectors['vectors']

        for i, vector in enumerate(self.w2v_vectors):
            self.modelVocab.append(vector)
            self.modelVectors.append(self.w2v_vectors[vector])
        
        # Scaling the data to bring all the attributes to a comparable level 
        self.scaler = StandardScaler() 
        self.X_scaled = self.scaler.fit_transform(self.modelVectors) 

        # Normalizing the data so that  
        # the data approximately follows a Gaussian distribution 
        self.X_normalized = normalize(self.X_scaled) 

        # Converting the numpy array into a pandas DataFrame 
        self.X_normalized = pd.DataFrame(self.X_normalized) 
        
        self.tsne = TSNE(perplexity=40, n_components=2, init='pca', n_iter=2500, random_state=23)
        self.X_principal = self.tsne.fit_transform(self.X_normalized) 
        self.X_principal = pd.DataFrame(self.X_principal) 
        self.X_principal.columns = ['P1', 'P2'] 
        print(self.X_principal.head())

    def dbscan(self):
        self._db = DBSCAN(eps=0.01, min_samples=5).fit(self.X_principal)
        self.cluster_labels = self._db.labels_

        for i, promoter in enumerate(self.modelVocab):  
            print(promoter + ": " + str(self.cluster_labels[i]))
            seq = next(seq for seq in self.w2v_coords['sequences'] if seq["promoter_id"] == str(promoter))
            seq['cluster_id'] = int(self.cluster_labels[i])
            seq.update({"x_tsne": float(self.X_principal['P1'][i])})
            seq.update({"y_tsne": float(self.X_principal['P2'][i])})
            self.new_coords['sequences'].append(seq)

        self.db = DBSCAN(eps=0.01, min_samples=5).fit(self.X_principal)
        self.core_samples_mask = np.zeros_like(self.db.labels_, dtype=bool)
        self.core_samples_mask[self.db.core_sample_indices_] = True
        self.cluster_labels = self.db.labels_

        for i, promoter in enumerate(self.modelVocab):  
            print(promoter + ": " + str(self.cluster_labels[i]))
            
        # Number of clusters in labels, ignoring noise if present.
        self.n_clusters_ = len(set(self.cluster_labels)) - (1 if -1 in self.cluster_labels else 0)
        self.n_noise_ = list(self.cluster_labels).count(-1)
        
        print('Estimated number of clusters: %d' % self.n_clusters_)
        print('Estimated number of noise points: %d' % self.n_noise_)
        print("Silhouette Coefficient: %0.3f" % metrics.silhouette_score(self.X_principal, self.cluster_labels))

    def saveData(self):
        with open(os.path.join(self._dir_path, '..', 'data','sequence_coords.json'), 'w') as filename: 
            json.dump(self.new_coords, filename, indent=4)
        print("sequence_coords.json is created")

def main():

    dbscan = DBSCAN_CLS()
    dbscan.read_vectors()
    dbscan.dbscan()
    dbscan.saveData()



if __name__ == "__main__":
    main()