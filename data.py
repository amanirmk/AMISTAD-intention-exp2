import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import simulation as s
import copy
import seaborn as sb
import shutil as sh

jsTemplateName = "htmlTest.js"
newjsFileName = "script.js"

defaultParams = {
        "p_d":0.1, 
        "p_c_a":0.7, 
        "p_c_h":0.5, 
        "p_c_h_u":0.2, 
        "cycle":3
    }

paramLabels = {
        "p_d":r"$P_d$",
        "p_c_a":r"$P_{k,a}$",
        "p_c_h":r"$P_{k,h}$",
        "p_c_h_u":r"$P_{k,s}$",
        "cycle":r"Cycle"
    }


def printProgressBar (iteration, total, prefix = 'Progress:', suffix = 'Complete', decimals = 1, length = 100, fill = '█', printEnd = "\r"):
    """
    Call in a loop to create terminal progress bar
    @params:
        iteration   - Required  : current iteration (Int)
        total       - Required  : total iterations (Int)
        prefix      - Optional  : prefix string (Str)
        suffix      - Optional  : suffix string (Str)
        decimals    - Optional  : positive number of decimals in percent complete (Int)
        length      - Optional  : character length of bar (Int)
        fill        - Optional  : bar fill character (Str)
        printEnd    - Optional  : end character (e.g. "\r", "\r\n") (Str)
    """
    percent = ("{0:." + str(decimals) + "f}").format(100 * (iteration / float(total)))
    filledLength = int(length * iteration // total)
    bar = fill * filledLength + '-' * (length - filledLength)
    print('\r%s |%s| %s%% %s' % (prefix, bar, percent, suffix), end = printEnd)
    # Print New Line on Complete
    if iteration == total: 
        print()


def dataToCSV(filename, inputs, data, new=True):
    """writes the data to a csv, if not new, appends to given csv"""
    runs, agents, steps = data.shape
    col_dict = copy.deepcopy(inputs)
    for key in col_dict:
        col_dict[key] = [col_dict[key]]*runs*2

    for step in range(steps):
        step_list = []
        for pair in data[:, :, step]:
            step_list += [pair[0], pair[1]]
        col_dict["step " + str(step)] = step_list

    df = pd.DataFrame.from_dict(col_dict)

    if new:
        df.to_csv(filename, index=False)
    else:
        df.to_csv(filename, mode='a', header=False, index=False)

def filterDataFrame(data, filterlist):
    data = copy.deepcopy(data)
    for param, value in filterlist:
        booleans = data[param] == value
        data = data[booleans]
    return data

def runStatsFromCSV(filename, filterlist=[], display=False):
    data = pd.read_csv(filename)
    data = filterDataFrame(filterlist)
    return runStatsFromDF(data, display)

def runStatsFromDF(df, display=False):
    num_exp = len(df.index) / 2
    df = df.to_numpy()
    hprob = np.sum(df[::2,-1] >= 0) / num_exp #prob of hero surviving
    aprob = np.sum(df[1::2,-1] >= 0) / num_exp #prob of adversary surviving
    
    h_s = float("{:.2f}".format(100 * hprob))
    h_ci = float("{:.3f}".format(196 * np.sqrt((hprob * (1-hprob))/num_exp)))
    a_s = float("{:.2f}".format(100 * aprob))
    a_ci = float("{:.3f}".format(196 * np.sqrt((aprob * (1-aprob))/num_exp)))

    hero_stat = (h_s, h_ci)
    adv_stat = (a_s, a_ci)

    if display:
        print()
        print("Heroes Survived (pct):", h_s, "+/-", h_ci)
        print("Advers Survived (pct):", a_s, "+/-", a_ci)
        print()  
    
    return [hero_stat, adv_stat]

def getRunsFromCSV(filename, filterlist, k=1):
    """returns first k runs that meet the list of parameters
    runs = [(hero1 move list, adv1 move list), (hero2 move list, adv2 move list),...]"""
    data = pd.read_csv(filename)
    data = filterDataFrame(data, filterlist)
    data = data.head(k*2)
    num = len(data.index)
    data = data.to_numpy()
    heroMoves = []
    adversaryMoves = []
    for i in range(num):
        if i % 2 == 0:
            heroMoves.append(data[i].tolist())
        else:
            adversaryMoves.append(data[i].tolist())
    runs = list(zip(heroMoves, adversaryMoves))
    return runs 

def heatMap(filename, param1, param2, calculatedParameters=[]):
    """calculated parameters is for variables that change but only in accordance to one of the input variables, 
    it is a list of [param_name, function to calculate, param input (1 or 2)]"""
    plt.rc('font', family='serif')

    data = pd.read_csv(filename)
    filterlist = []
    for dp in defaultParams:
        if dp not in [param1, param2] + [param for param, calc, arg in calculatedParameters]:
            #hold all other variables constant at the defaults
            filterlist.append([dp, defaultParams[dp]])
    
    df0 = filterDataFrame(data, filterlist + [["hero_mode", 0]])
    df1 = filterDataFrame(data, filterlist + [["hero_mode", 1]])
    df2 = filterDataFrame(data, filterlist + [["hero_mode", 2]])
    df3 = filterDataFrame(data, filterlist + [["hero_mode", 3]])
    df4 = filterDataFrame(data, filterlist + [["hero_mode", 4]])
    dfs = [df0, df1, df2, df3, df4]
    
    modes = [r"NEVER", r"ALWAYS", r"RANDOM", r"RETALIATE", r"INTENTION"]

    plt.style.use('ggplot')
    fig, axes = plt.subplots(2,5)
    fig.tight_layout(w_pad=0, h_pad=1, rect=[0,0,0.9, 0.95])
    cbar_ax = fig.add_axes([.91,0.11,.03,0.77])

    axs = axes.flat
    for i in range(5):
        df = dfs[i]
        p1v = []
        p2v = []
        hero = []
        adv = []

        for val1, group1 in df.groupby(param1):
            tempdf = filterDataFrame(df, [[param1, val1]])
            for val2, group2 in tempdf.groupby(param2):
                filters = [[param2, val2]]               
                for param, calc, arg in calculatedParameters:
                    if arg == 1:
                        val = calc(val1)
                    else:
                        val = calc(val2)
                    filters.append([param, val])

                temptempdf = filterDataFrame(tempdf, filters)
                if len(temptempdf.index) > 0:
                    hstats, astats = runStatsFromDF(temptempdf, False)
                    p1v.append(val1)
                    p2v.append(val2)
                    hero.append(hstats[0])
                    adv.append(astats[0])
        
        hcols = list(zip(p1v, p2v, hero))
        acols = list(zip(p1v, p2v, adv))
        hdf = pd.DataFrame(hcols, columns=[param1, param2, "Hero Rates"])
        adf = pd.DataFrame(acols, columns=[param1, param2, "Adversary Rates"])
        hdata = hdf.pivot_table(index=param1, columns=param2, values="Hero Rates")
        adata = adf.pivot_table(index=param1, columns=param2, values="Adversary Rates")
        axs[i].set_title(modes[i] + r" (Hero)")
        axs[i+5].set_title(modes[i] + r" (Adversary)")
        sb.heatmap(hdata, ax=axs[i], vmin=0, vmax=100, cbar_ax=cbar_ax, cmap='RdYlGn')
        sb.heatmap(adata, ax=axs[i+5], vmin=0, vmax=100, cbar_ax=cbar_ax, cmap='RdYlGn')
    lbl1 = paramLabels[param1]
    lbl2 = paramLabels[param2]
    fig.suptitle("Effect of " + lbl1 + " and " + lbl2 + " on Survival Rates")
    for ax in axs:
        ax.set(xlabel=lbl1, ylabel=lbl2)
    plt.rc('text', usetex=True)
    plt.show()
        

def linearRunGraph(filename, param):
    data = pd.read_csv(filename)
    plt.style.use('ggplot')
    plt.rc('font', family='serif')
    filterlist = []
    for dp in defaultParams:
        if dp != param:
            #hold all other variables constant and the defaults
            filterlist.append([dp, defaultParams[dp]])
    
    df0 = filterDataFrame(data, filterlist + [["hero_mode", 0]])
    df1 = filterDataFrame(data, filterlist + [["hero_mode", 1]])
    df2 = filterDataFrame(data, filterlist + [["hero_mode", 2]])
    df3 = filterDataFrame(data, filterlist + [["hero_mode", 3]])
    df4 = filterDataFrame(data, filterlist + [["hero_mode", 4]])
    dfs = [df0, df1, df2, df3, df4]
    modes = [r"NEVER", r"ALWAYS", r"RANDOM", r"RETALIATE", r"INTENTION"]
    
    fig, axes = plt.subplots(2,3)
    axs = axes.flat
    fig.tight_layout(rect=[0.05,0.05,0.95, 0.95])

    colorIter = iter(['darkgreen', 'forestgreen', 'mediumseagreen','mediumaquamarine','turquoise'])
    for i in range(5):
        df = dfs[i]
        values = []
        hero = []
        adv = []
        for val, group in df.groupby(param):
            hstats, astats = runStatsFromDF(group, False)
            values.append(val)
            hero.append(hstats[0])
            adv.append(astats[0])
        color = next(colorIter)
        if i == 0:
            axs[i].plot(values, hero, label=r"Hero Rates", color='lime', linewidth=2)
            axs[i].plot(values, adv, label=r"Adversary Rates", color='r', linewidth=2)
        else:
            axs[i].plot(values, hero, color='lime', linewidth=2)
            axs[i].plot(values, adv, color='r', linewidth=2)
        axs[5].plot(values, hero, label=r"Hero: " + modes[i], color=color, linewidth=2)
        axs[i].set_title(modes[i])
        if i == 4:
            fig.legend(prop={"size":12})
    
    lbl = paramLabels[param]
    for ax in axs:  
        ax.set(ylim=(0,101))
        ax.set_xlabel(lbl + r" value")
        ax.set_ylabel(r"Survival Rates")
        ax.tick_params(axis='both', which='major', labelsize=9, direction='in')
    axs[5].set_title(r"HERO COMPARISON")
    #fig.legend([r"Hero", r"Adversary"])
     #r"Hero: NEVER", r"Hero: ALWAYS", r"Hero: RANDOM", r"Hero: RETALIATE", r"Hero: Intention"])
    fig.suptitle(r"Effect of " + lbl + r" on Survival Rates")
    plt.rc('text', usetex=True)
    plt.show()


def runExp2(num_exp):
    filename = "exp2results.csv"
    first = True #im sorry

    #test all modes
    for hero_mode in range(5):        
        print("HERO MODE", hero_mode)
        print(0)
        #linear test of prob detection
        for p_d in range(5, 20+1, 5):
            p_d /= 100
            inputs, data = s.simulate(hero_mode, num_exp, probDetect=p_d)
            dataToCSV(filename, inputs, data, first)
            first = False

        print(1) 
        #linear test of additional crit boost
        for p_c_h_u in range(0, 50+1, 5):
            p_c_h_u /= 100
            inputs, data = s.simulate(hero_mode, num_exp, probSurpriseCrit=p_c_h_u)
            dataToCSV(filename, inputs, data, first)
            first = False

        print(2)
        #co-vary crit with cycle 
        #(normal "linear" cycle is when p_c_a = 0.7)
        for cycle in range(1, 10+1, 1):
            #vary all critical hits together
            for p_c_a in range(2, 10+1, 1):
                p_c_h = (p_c_a - 2 )/ 10 # - 2 from p_c_h_u
                p_c_a /= 10
                inputs, data = s.simulate(hero_mode, num_exp, probAdversaryCrit=p_c_a, probHeroCrit=p_c_h, cycle=cycle)
                dataToCSV(filename, inputs, data, first)
                first = False

        print(3)
        #co-vary p_c_a and p_c_h
        #(normal "linear" p_c_a is when p_c_h = 0.5)
        #(normal "linear" p_c_h is when p_c_a = 0.7)
        for p_c_a in range(0, 10+1, 1):
            p_c_a /= 10
            for p_c_h in range(0, 8+1, 1): # so p_c_h_u + p_c_h <= 1
                p_c_h /= 10
                inputs, data = s.simulate(hero_mode, num_exp, probAdversaryCrit=p_c_a, probHeroCrit=p_c_h)
                dataToCSV(filename, inputs, data, first)
                first = False

def visualizeRun(filename, filterlist, k=1, nth=0):
    """Visualize a single run by writing its info to a js file, which can be run in browser
    filename: name of csv to read from
    filterlist: filters to apply 
    k: number of runs to extract
    nth: the nth run to visualize (out of the extracted runs)"""
    # get run info
    info = getRunsFromCSV(filename, filterlist, k)
    runInfo = info[nth]
    hasPerceptionString = str(runInfo[0][0] == 4).lower() # [0][0] is because runInfo is of the form [([heroStates], [adversaryStates])]
    attackCycle = runInfo[0][5]
    heroList = runInfo[0][7::] 
    adversaryList = runInfo[1][7::]
    # write to js file
    writeTojs(hasPerceptionString, attackCycle, heroList, adversaryList)


def writeTojs(hasPerceptionString, attackCycle, heroList, adversaryList):
    """Appends a method to a js file that allows the js file to populate its arrays
        with the character states."""
    newFile = open(newjsFileName, "w") # create new file
    newFile.close()
    sh.copy(jsTemplateName, newjsFileName) # copy contents of template to new file
    jsFile = open(newjsFileName, "a") # open the file to append to
    jsFile.write("function getInput(){\n")
    jsFile.write("hasPerception = " + hasPerceptionString + ";\n")
    jsFile.write("attackCycle = " + str(attackCycle) + ";\n")
    jsFile.write("heroStates = " + str(heroList) + ";\n")
    jsFile.write("adversaryStates = " + str(adversaryList) + ";\n")
    jsFile.write("}")
    jsFile.close()
"""
[
        ([hero2 move], [adversary2 move])
]


def appendTojs(numSims, csvFileName):
    [hasPerceptionArray, cycleNumArray, heroArray, adversaryArray] = getDataFromCSV(csvFileName)
    writeTojs(numSims, hasPerceptionArray, cycleNumArray, heroArray, adversaryArray)

def getDataFromCSV(csvFileName):
    Reads from a CSV file. Returns two 2-d arrays. The first is the hero array, second is 
    adversary array. Each row is one run, each column is one frame
    dataFrame = pd.read_csv(csvFileName)
    array = dataFrame.to_numpy()
    
    # if this run has perception turned on
    hasPerceptionArray= array[::2, 0] # get every other element in the first column
    cycleNumArray = array[::2, 5] # every other element in 5th column 
    heroArray = array[::2, 7::] # every other row. Heros are first. frame 0 is at 7th column.
    adversaryArray = array[1::2, 7::]
    return [hasPerceptionArray, cycleNumArray, heroArray, adversaryArray]

def writeTojs(numSims, hasPerceptionArray, cycleNumArray, heroArray, adversaryArray):
    Appends a method to a js file that allows the js file to populate its arrays
        with the character states.
    newFile = open(newjsFileName, "w") # create new file
    newFile.close()
    sh.copy(jsTemplateName, newjsFileName) # copy contents of template to new file
    jsFile = open(newjsFileName, "a") # open the file to append to
    jsFile.write("function getInput(){\n")
    #arrString = np.array2string(hasPerceptionArray, separator=", ")
    jsFile.write("hasPerceptionArray = " + np.array2string(hasPerceptionArray, separator=", ") + ";\n")
    jsFile.write("attackCycleArray = " + np.array2string(cycleNumArray, separator=", ") + ";\n")
    jsFile.write("heroStates = " + np.array2string(heroArray, separator=', ') + ";\n")
    jsFile.write("adversaryStates = " + np.array2string(adversaryArray, separator=', ') + ";\n")
    jsFile.write("numSims = " + str(numSims) + ";\n")
    jsFile.write("}")
    jsFile.close() """