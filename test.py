import os.path as path
import pandas as pd

# Get path of ./data/dataframe.csv
PATH = path.join(path.dirname(__file__),
                 'data', 'dataframe.csv')

df = pd.read_csv(PATH)

# Group by 'TAG' and get the mean of 'AVERAGE_HEARTRATE'
df.groupby('TAG')['AVERAGE_HEARTRATE'].mean()

# Show mean of 'AVERAGE_HEARTRATE' for each 'TAG'
print(df.groupby('TAG')['AVERAGE_HEARTRATE'].mean())
