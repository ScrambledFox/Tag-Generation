import os.path as path
import pandas as pd

PATH = path.join(path.dirname(__file__),
                 'data', 'dataframe.csv')

df = pd.read_csv(PATH)

print(df)

# Count how many rows have a value of 'True' of columns that start with 'TAG_'
# print(df.filter(regex='^TAG_').sum(axis=1).value_counts())

tags_df = df.filter(regex='^TAG_')


print(tags_df.sum(axis=0))
