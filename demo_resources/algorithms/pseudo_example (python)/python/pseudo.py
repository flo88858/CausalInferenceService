import sys
import csv
import time

def write_numbers_to_csv(x,y,alpha,resultID):

    # Sleep for 3 seconds
    time.sleep(3)

    # Data to write to the CSV file
    data = [("x", x), ("y", y), ("alpha", alpha)]

    filePath = f"results/{resultID}.csv"

    # Write data to a CSV file
    with open(filePath, 'w', newline='') as csvfile:
        fieldnames = ['Parameter', 'Value']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        # Write the header
        writer.writeheader()

        # Write the data
        for row in data:
            writer.writerow({'Parameter': row[0], 'Value': row[1]})#


if __name__ == "__main__":
    csvFile = sys.argv[1]
    x = sys.argv[2]
    y = sys.argv[3]
    alpha = sys.argv[4]
    resultID = sys.argv[5]

    # Write numbers to a CSV file
    write_numbers_to_csv(x,y,alpha,resultID)
