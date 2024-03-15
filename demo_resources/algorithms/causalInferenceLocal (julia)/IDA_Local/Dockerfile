# Use an official Julia runtime as a parent image
FROM julia:latest

# Set the working directory in the container
WORKDIR /app

# Copy all algorithm files
COPY . /app/ 

# Create the results directory
RUN mkdir -p /app/results

# Install the required packages
RUN julia -e 'using Pkg; \
    Pkg.add(PackageSpec(name = "CSV", version = "0.10.10")); \
    Pkg.add(PackageSpec(name = "CausalInference", version = "0.9.1")); \
    Pkg.add(PackageSpec(name = "DataFrames", version = "1.5.0")); \
    Pkg.add("GLM"); \
    Pkg.add("GraphPlot"); \
    Pkg.add("Graphs"); \
    Pkg.add("JSON"); \
    Pkg.add(PackageSpec(name = "LinearSolve", version = "1.42.0")); \
    Pkg.add("LinkedLists"); \
    Pkg.add(PackageSpec(name = "Plots", version = "1.38.12")); \
    Pkg.add(PackageSpec(name = "StatsPlots", version = "0.15.5"));' 


