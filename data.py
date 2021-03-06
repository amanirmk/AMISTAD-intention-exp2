import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import simulation as s
import copy
import seaborn as sb
import shutil as sh
from matplotlib.colors import LinearSegmentedColormap

jsTemplateName = "animation/template.js"
newjsFileName = "animation/script.js"

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
    runs, _, steps = data.shape # _ = agents
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
    data = filterDataFrame(data, filterlist)
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

def heatMap(data, param1, param2, calculatedParameters=[]):
    """calculated parameters is for variables that change but only in accordance to one of the input variables, 
    it is a list of [param_name, function to calculate, param input (1 or 2)]"""
    
    #load df
    data = copy.deepcopy(data)
    
    filterlist = []
    for dp in defaultParams:
        if dp not in [param1, param2] + [param for param, _, _ in calculatedParameters]:
            #hold all other variables constant at the defaults
            filterlist.append([dp, defaultParams[dp]])
    
    #filter dataframes according to the modes and collect in dfs
    dfs = []
    for i in range(5):
        dfs.append(filterDataFrame(data, filterlist + [["hero_mode", i]]))
    
    #define mode names (r prefix does latex)
    modes = [r"NEVER", r"ALWAYS", r"RANDOM", r"RETALIATE", r"INTENTION"]

    #plot design
    red = (158, 26, 13)
    grn = (104, 163, 132)
    mix = (243, 223, 136)
    colors = [  (red[0]/255., red[1]/255., red[2]/255.),
            (mix[0]/255., mix[1]/255., mix[2]/255.),
            (grn[0]/255., grn[1]/255., grn[2]/255.)]
    cm = LinearSegmentedColormap.from_list(
        'customized', colors, N=200)
    plt.rc('font', family='sans-serif')
    plt.style.use('ggplot')
    fig, axes = plt.subplots(2,5, figsize=(9,5))
    fig.tight_layout(w_pad=0, h_pad=1, rect=[0,0,0.9, 0.95])
    cbar_ax = fig.add_axes([.91,0.11,.03,0.77])
    axs = axes.flat

    for i in range(5):
        df = dfs[i]
        p1v = [] # values for param 1
        p2v = [] # values for param 2
        hero = [] # survival values hero
        adv = [] # survival values adversary

        for val1, _ in df.groupby(param1): # _ = group1
            # filter for specific param 1 value
            val1df = filterDataFrame(df, [[param1, val1]])

            for val2, _ in val1df.groupby(param2): # _ = group2
                #add filter for specific param 2 value
                filters = [[param2, val2]]            
                #add filters for any additional calculated variables (ie p_c_h when doing (p_c_a and p_c_h) vs cycle)
                for param, calc, arg in calculatedParameters:
                    if arg == 1:
                        val = calc(val1)
                    else:
                        val = calc(val2)
                    val = round(val, 1)
                    filters.append([param, val])
                
                #filter the df again
                filtered_df = filterDataFrame(val1df, filters)

                if len(filtered_df.index) > 0:
                    #if non-empty, collect survival statistics
                    hstats, astats = runStatsFromDF(filtered_df, False)
                    p1v.append(val1)
                    p2v.append(val2)
                    hero.append(hstats[0])
                    adv.append(astats[0])
        #combine values together into points to plot
        hcols = list(zip(p1v, p2v, hero))
        acols = list(zip(p1v, p2v, adv))
        hdf = pd.DataFrame(hcols, columns=[param1, param2, "Hero Rates"])
        adf = pd.DataFrame(acols, columns=[param1, param2, "Adversary Rates"])
        hdata = hdf.pivot_table(index=param1, columns=param2, values="Hero Rates")
        adata = adf.pivot_table(index=param1, columns=param2, values="Adversary Rates")
        #plot hero graph
        axs[i].set_title(modes[i] + r" (Hero)", fontsize=6)
        sb.heatmap(hdata, ax=axs[i], vmin=0, vmax=100, cbar_ax=cbar_ax, cmap=cm)
        #plot adv graph below
        axs[i+5].set_title(modes[i] + r" (Adversary)", fontsize=6)
        sb.heatmap(adata, ax=axs[i+5], vmin=0, vmax=100, cbar_ax=cbar_ax, cmap=cm)
    
    #get latex labels from code parameters
    lbl1 = paramLabels[param1]
    lbl2 = paramLabels[param2]

    #add title and labels
    fig.suptitle("Effect of " + lbl1 + " and " + lbl2 + " on Survival Rates", fontsize=8, fontweight='bold')
    for ax in axs:
        ax.set_xlabel(lbl2, fontsize=8)
        ax.set_ylabel(lbl1, fontsize=8)
        ax.tick_params(labelsize=6)
        ax.invert_yaxis()

    plt.subplots_adjust(hspace=0.4, wspace=0.5, top=0.89)
    plt.rc('text', usetex=True)

    plt.savefig(param1 + '_v_' + param2 + '.pdf', bbox_inches='tight', pad_inches=0.1)
    plt.close('all')

def linearCautious(data, param):
    labelsize = 18
    legendsize = 14
    titlesize = 20
    ticksize = 16

    data = copy.deepcopy(data)
    plt.style.use('ggplot')
    plt.rc('text', usetex=True)
    plt.rc('font', family='sans-serif')
    filterlist = []
    for dp in defaultParams:
        if dp != param:
            #hold all other variables constant and the defaults
            filterlist.append([dp, defaultParams[dp]])
    
    cautious = filterDataFrame(data, filterlist + [["hero_mode", 5]])
    random = filterDataFrame(data, filterlist + [["hero_mode", 2]])
    intention = filterDataFrame(data, filterlist + [["hero_mode", 4]])
    dfs = [cautious, random, intention]
    modes = [r"CAUTIOUS", r"RANDOM", r"INTENTION", r"COMPARISON"]
    
    fig = plt.figure(figsize=(5,5))

    colors = ['#F2A172', '#4FADAC', '#2F5373']
    
    for i in range(3):
        df = dfs[i]
        values = []
        hero = []
        adv = []
        up_hci = []
        low_hci = []
        up_aci = []
        low_aci = []
        for val, group in df.groupby(param):
            hstats, astats = runStatsFromDF(group, False)
            values.append(val)
            hmean, hci = hstats
            amean, aci = astats
            hero.append(hmean)
            adv.append(amean)
            up_hci.append(hmean+hci)
            low_hci.append(hmean-hci)
            up_aci.append(amean+aci)
            low_aci.append(amean-aci)
        fig.gca().plot(values, hero, label=r"Hero: " + modes[i], color=colors[i], linewidth=2)
        fig.gca().fill_between(values, low_hci, up_hci, color=colors[i], alpha=.15)
    
    fig.gca().set_title(r"HERO COMPARISON", fontsize=titlesize, fontweight='bold')
    fig.gca().legend(["CAUTIOUS", "RANDOM", "INTENTION"], prop={"size":legendsize}, facecolor="white", edgecolor="black")
    lbl = paramLabels[param]
    fig.gca().set(ylim=(0,101))
    fig.gca().set_xlabel(lbl + r" value", fontsize=labelsize, fontweight='bold')
    fig.gca().set_ylabel(r"Survival Rates", fontsize=labelsize, fontweight='bold')
    fig.gca().tick_params(axis='both', which='major', labelsize=ticksize, direction='in')
    fig.tight_layout()
    fig.savefig('p_dCAUTIOUS.pdf', bbox_inches='tight', pad_inches=0)
    plt.close('all')
        

def linearRunGraph(data, param):
    labelsize = 18
    legendsize = 14
    titlesize = 20
    ticksize = 16

    data = copy.deepcopy(data)
    plt.style.use('ggplot')
    plt.rc('text', usetex=True)
    plt.rc('font', family='sans-serif')
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
    modes = [r"NEVER", r"ALWAYS", r"RANDOM", r"RETALIATE", r"INTENTION", r"COMPARISON"]
    
    figs = []
    for i in range(6):
        figs.append(plt.figure(figsize=(5,5)))

    colorIter = iter(['#F3DF88', '#F2A172', '#4FADAC', '#5386A6', '#2F5373'])
    
    for i in range(5):
        df = dfs[i]
        values = []
        hero = []
        adv = []
        up_hci = []
        low_hci = []
        up_aci = []
        low_aci = []
        for val, group in df.groupby(param):
            hstats, astats = runStatsFromDF(group, False)
            values.append(val)
            hmean, hci = hstats
            amean, aci = astats
            hero.append(hmean)
            adv.append(amean)
            up_hci.append(hmean+hci)
            low_hci.append(hmean-hci)
            up_aci.append(amean+aci)
            low_aci.append(amean-aci)
        figs[i].gca().plot(values, hero, label="Hero", color='#2F5373', linewidth=2)
        figs[i].gca().fill_between(values, low_hci, up_hci, color='#2F5373', alpha=.15)
        figs[i].gca().plot(values, adv, label="Adversary", color='#F2A172', linewidth=2)
        figs[i].gca().fill_between(values, low_aci, up_aci, color='#F2A172', alpha=.15)
        figs[i].gca().legend(prop={"size":legendsize}, facecolor="white", edgecolor="black")
        color = next(colorIter)
        figs[5].gca().plot(values, hero, label=r"Hero: " + modes[i], color=color, linewidth=2)
        figs[5].gca().fill_between(values, low_hci, up_hci, color=color, alpha=.15)
        figs[i].gca().set_title(modes[i], fontsize=titlesize, fontweight='bold')
    
    figs[5].gca().set_title(r"HERO COMPARISON", fontsize=titlesize, fontweight='bold')
    figs[5].gca().legend(prop={"size":legendsize}, facecolor="white", edgecolor="black")
    lbl = paramLabels[param]
    for i in range(len(figs)): 
        fig = figs[i] 
        fig.gca().set(ylim=(0,101))
        fig.gca().set_xlabel(lbl + r" value", fontsize=labelsize, fontweight='bold')
        fig.gca().set_ylabel(r"Survival Rates", fontsize=labelsize, fontweight='bold')
        fig.gca().tick_params(axis='both', which='major', labelsize=ticksize, direction='in')
        fig.tight_layout()
        fig.savefig(param + modes[i] + '.pdf', bbox_inches='tight', pad_inches=0)
    plt.close('all')


def probIntentionAttack(filename, param):
    data = pd.read_csv(filename)
    filterlist = []
    for dp in defaultParams:
        if dp != param:
            #hold all other variables constant and the defaults
            filterlist.append([dp, defaultParams[dp]])
    filterlist.append(["hero_mode", 4])
    data = filterDataFrame(data, filterlist)
    for val, group in data.groupby(param):
        print(val)
        groupSteps = 0
        groupAttacks = 0
        for _, hero in group.iterrows():
            step = 0
            hasAttacked = False
            cycle = hero["cycle"]
            while hasAttacked == False and step < 10:
                step += 1 #can't make any moves on 0th step, doesn't count
                hasAttacked = hero["step " + str(step)] < cycle
            groupAttacks += hasAttacked
            groupSteps += step
        print(groupAttacks, groupSteps)
        print(groupAttacks / groupSteps)
        print()


pra = {
    "0.05" : 0.04695709361945706,
    "0.1" : 0.09265246573484506,
    "0.15" : 0.13701122556672976,
    "0.2" : 0.1786621024104978,
}

def runCautious(filename, num_exp):
    first = True
    for hero_mode in [2,4,5]:
        for p_d in range(5, 20+1, 5):
            p_d /= 100
            if hero_mode == 5:
                real_mode = 2
                p_r_a = pra[str(p_d)]
                inputs, data = s.simulate(real_mode, num_exp, probDetect=p_d, probRandAttack=p_r_a)
                inputs["hero_mode"] = 5
            else:
                inputs, data = s.simulate(hero_mode, num_exp, probDetect=p_d)
            dataToCSV(filename, inputs, data, first)
            first = False

def runExp2(filename, num_exp):
    first = True
    #test all modes
    for hero_mode in range(5):        
        #linear test of prob detection
        for p_d in range(5, 20+1, 5):
            p_d /= 100
            inputs, data = s.simulate(hero_mode, num_exp, probDetect=p_d)
            dataToCSV(filename, inputs, data, first)
            first = False
        #linear test of additional crit boost
        for p_c_h_u in range(0, 50+1, 5):
            p_c_h_u /= 100
            inputs, data = s.simulate(hero_mode, num_exp, probSurpriseCrit=p_c_h_u)
            dataToCSV(filename, inputs, data, first)
            first = False
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

