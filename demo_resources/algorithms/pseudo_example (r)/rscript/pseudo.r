# Sleep for 3 seconds
Sys.sleep(3)

# Function to write numbers to a CSV file
write_numbers_to_csv <- function(x, y, alpha, resultID) {

  # Data to write to the CSV file
  data <- data.frame(
    Parameter = c("x", "y", "alpha"),
    Value = c(x, y, alpha)
  )

  filePath <- paste("results/", resultID, ".csv", sep = "")

  # Write data to a new CSV file
  write.csv(data, file = filePath, row.names = FALSE)
}

# Command-line arguments
args <- commandArgs(trailingOnly = TRUE)
csvFile <- args[1]
x <- args[2]
y <- args[3]
alpha <- args[4]
resultID <- args[5]


# Write numbers to a CSV file
write_numbers_to_csv(x, y, alpha, resultID)
