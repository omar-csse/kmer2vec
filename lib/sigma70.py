import os
import json
import random
from pathlib import Path


class Sigma70(object):

    """setup sigma70 sequences."""


    def __init__(self, k=6):

        self._promoter = {}
        self._data = []
        self._sigma70 = {}
        self._dir_path = os.path.dirname(os.path.realpath(__file__))


    def setupSigma70(self):

        self._promoter = json.load(open(self._dir_path + '/../db/promoter.json'))['ROWSET']['ROW']
        self._sigma70 = list(filter(lambda x: 'Sigma70' in str(x['SIGMA_FACTOR'].values()) and '_text' in x['PROMOTER_SEQUENCE'], self._promoter))
        print("\n\nsigma70 is setup")

    def generateSigma70(self):

        for x in self._sigma70:
            row = {
                "PROMOTER_ID": x['PROMOTER_ID']['_text'],
                "PROMOTER_SEQUENCE": x['PROMOTER_SEQUENCE']['_text'].upper(),
            }
            self._data.append(row)

        print("sigma70 data is generated")

    def saveSigma70(self):

        if not os.path.exists(self._dir_path + '/data'): 
            os.mkdir(self._dir_path + '/data')

        with open(self._dir_path + '/data/sigma70.json', 'w') as filename: json.dump(self._data, filename, indent=4)
        print("sigma70 data is saved")


def main():

    sigma70 = Sigma70()

    sigma70.setupSigma70()
    sigma70.generateSigma70()
    sigma70.saveSigma70()


if __name__ == "__main__":
    main()
    print("sigma70 data is ready to be used in data.py\n\n")