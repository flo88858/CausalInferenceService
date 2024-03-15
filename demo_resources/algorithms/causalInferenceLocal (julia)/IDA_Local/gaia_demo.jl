
using CSV
using DataFrames
using CausalInference
using GraphPlot

include("ida.jl")





function get_effects_all_alphas(df, alphas, x, y)
    effects_all_alphas = DataFrame(Alpha = String[], Effect=Float64[], Multip=Float64[])
    for alpha in alphas
        est_CPDAG = pcalg(df, alpha, gausscitest)
        est_effects, multips = multiplicities(est_CPDAG, x, y, df)
        effects_all_alphas = add_all_effects!(effects_all_alphas, est_effects, multips, alpha)
    
    end
    return effects_all_alphas
end



function add_all_effects_global(est_effects, multips)

    effs = DataFrame(Effect=Float64[], Probability=Float64[])

    for k in keys(est_effects)
        if get(est_effects, k, 0) in effs[:,1]
        n = get(est_effects, k, 0)
        effs[effs.Effect .== n, :Probability] .= effs[effs.Effect .== n, :Probability] .+ get(multips, k, 0)/sum(values(multips))
        else
            push!(effs, (get(est_effects, k, 0), get(multips, k, 0)/sum(values(multips))))
        end
    end

    return effs
end

function add_all_effects_local(est_effects)

    effs = DataFrame(Effect=Float64[], Probability=Float64[])

    for k in keys(est_effects)
        if get(est_effects, k, 0) in effs[:,1]
        n = get(est_effects, k, 0)
        effs[effs.Effect .== n, :Probability] .= effs[effs.Effect .== n, :Probability] .+ 1/length(est_effects)
        else
            push!(effs, (get(est_effects, k, 0), 1/length(est_effects)))
        end
    end

    return effs
end



function gaia_demo_local(csv, x, y, alpha_val, resultID)
    data = DataFrame(csv)
    est_CPDAG = pcalg(data, alpha_val, gausscitest)
    est_effects = loc_ida(est_CPDAG, x, y, data)
    all_effects = add_all_effects_local(est_effects)
    CSV.write("results/$resultID.csv", all_effects) # Note: Results must be written in the results folder using the resultID
    return all_effects
end


######### Code Execution Engine Framework ##########

# Parsing Parameters
csvFile = ARGS[1]
x = parse(Int64, ARGS[2])
y = parse(Int64, ARGS[3])
alpha = parse(Float64, ARGS[4])
resultID = ARGS[5]

# Reading Dataset
csv = CSV.read("$csvFile", DataFrame)
# Starting Algorithm
gaia_demo_local(csv, x, y, alpha, resultID)