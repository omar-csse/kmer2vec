#!/bin/bash -l

#PBS -N kmer2vec
#PBS -l ncpus=6
#PBS -l ngpus=2
#PBS -l gputype=P100
#PBS -l mem=16GB
#PBS -l walltime=48:00:00
cd $PBS_O_WORKDIR    

module load tensorflow/1.5.0-gpu-p100-foss-2018a-python-3.6.4
pip3 install --upgrade numpy --user
pip3 install --upgrade pandas --user
pip3 install --upgrade h5py --user
python kmer2vec.py