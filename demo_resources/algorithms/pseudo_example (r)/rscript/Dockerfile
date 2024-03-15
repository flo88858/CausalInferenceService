# Use an official R runtime as a parent image
FROM r-base:latest

# Set the working directory in the container
WORKDIR /app

# Copy all algorithm files
COPY . /app/ 

# Create the results directory
RUN mkdir -p /app/results