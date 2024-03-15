<template>
  <div class="flex justify-center items-center">
    <div class="flex flex-col justify-center items-center space-y-12 md:m-24 mx-4 my-6">
      <TextCard
        :heading="howToUseApplicationText.heading"
        :paragraphs="howToUseApplicationText.paragraphs"
      ></TextCard>

      <TextCard
        :heading="algorithmInfoText.heading"
        :paragraphs="algorithmInfoText.paragraphs"
      ></TextCard>
    </div>
  </div>
</template>
  
  
  <script>
import TextCard from '../components/TextCard.vue'
export default {
  components: { TextCard },
  data() {
    return {
      howToUseApplicationText: {
        heading: 'How to use this application',
        paragraphs: [
          {
            subHeading: '',
            text: 'First, choose a name for your calculation. The results will be saved and you can retrieve them under this name. Then, select whether you want to use the local or global IDA algorithm and which dataset you want to use (at the moment only the dataset described below is available). Now, select your X- and Y- variable. The algorithm will calculate, which causal effects of X on Y are possible. Finally, choose the alpha value. This has to be between 0 and 1, for more information on this see the section below. Now you can start your calculation. You may start several calculations, using different algorithms, X-, Y- and alpha-values which will be run in the background. Once the calculations are finished, you can find their results under their respective names in the “Results” tab.'
          }
        ]
      },
      algorithmInfoText: {
        heading: 'Causal Inference Application',
        paragraphs: [
          {
            subHeading: '',
            text: 'This application presents a service for the estimation of the causal effects between variables in an observational dataset. It can be used for a wide range of applications, as for example the estimation of causal effects between certain genes.'
          },
          {
            subHeading: 'Dataset',
            text: 'Any numerical dataset could be used in this application, currently a sample data set is provided, which was created using the SynTReN generator (<a class="italic hover:text-blue-400" href="https://bmcbioinformatics.biomedcentral.com/articles/10.1186/1471-2105-7-43">Van den Bulcke et al., 2006</a>). Here, 1000 expressions of 1000 genes of the Escherichia Coli bacterium were simulated.'
          },
          {
            subHeading: 'Estimation Algorithms',
            text: 'For the estimation, the so called IDA (Intervention-calculus when the DAG is Absent) algorithms are used. These algorithms assume, that there is an underlying graph (more specifically a directed acyclic graph, DAG) which describes how different variables in the data influence each other. The algorithm then tries to recover this graph, in order to make a prediction, whether a given variable X has a causal effect on another given variable Y, and if so, it estimates the strength of this effect. It is often the case, that the underlying DAG cannot be clearly determined and there are multiple possible DAGs. In this case the algorithms determine all possible effects and their respective probabilities. A crucial step here is the estimation of the so called CPDAG (Completed Partially Directed Acyclic Graph) using the PC algorithm described in (<a class="italic hover:text-blue-400" href="https://www.cse.sc.edu/~mgv/csce582sp14/presentations/SpirtesGlymourPC.pdf">Spirtes and Glymour, 1991</a>). One important variable in the PC-algorithm is the alpha value. Greatly simplified, it describes the probability, that an edge between two variables, which does not exist in the true underlying DAG, will appear in the estimated DAGs. Thus, setting this value to 0 would assure, that the estimated DAGs only contain edges which also appear in the true underlying graph. However, the smaller the alpha value, the greater is also the probability, for the estimated DAGs to not contain certain edges from the true underlying DAG. The estimated DAGs are finally used to estimate the causal effect. For more details regarding these algorithms, see (<a class="italic hover:text-blue-400" href="https://arxiv.org/abs/0810.4214">Maathuis, Kalisch, and Bühlmann, 2009</a>).'
          },
          {
            subHeading: 'Local vs. Global Algorithm Variations',
            text: 'Both their local and global algorithm variations are available in this application, the global variant using the efficient implementation by (<a class="italic hover:text-blue-400" href="https://arxiv.org/abs/2012.09679">Wienöbst, Bannach, and Liśkiewicz, 2021</a>). While the global algorithm might be slower for some datasets, it produces more accurate probabilities. The local variant can be faster, it can however only estimate the probabilities, when more then one causal effect are possible. '
          }
        ]
      }
    }
  }
}
</script>