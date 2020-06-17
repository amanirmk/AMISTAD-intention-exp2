import numpy as np

hero_decision_modes = {
            'NEVER' : 0,
            'ALWAYS' : 1,
            'RANDOM' : 2,
            'RETALIATE': 3,
            'INTENTION': 4
        }

def simulate(hero_mode, numExperiment=1000000, numIterations=10, probDetect=0.1, probAdversaryCrit=0.7, probHeroCrit=0.5, probSurpriseCrit=0.2, probRandAttack=0.2, cycle=3):
    N = numIterations #number of steps in the run
    num_exp = numExperiment # number of runs
    p_d = probDetect #probability of detection
    p_c_a = probAdversaryCrit #probability of critical hit from adversary
    p_c_h = probHeroCrit #probability of critical hit from hero
    p_c_h_u = probSurpriseCrit #probability of (addtional bonus) critical hit from hero when unexpected (LE ELEMENT OF SURPRISE)
    probRandAttack #probability of hero randomly attacking (when hero mode is random)
    cycle_max = cycle - 1 
    intention_perception = (hero_mode == hero_decision_modes['INTENTION'])
    
    inputs = {
        "hero_mode":hero_mode, 
        "p_d":p_d, 
        "p_c_a":p_c_a, 
        "p_c_h":p_c_h, 
        "p_c_h_u":p_c_h_u, 
        "cycle":cycle
        }

    data = np.ones((num_exp, 2, N+1)) * 2 * N

    for i in range(0, N):
         # Update state
        hero_attack_mode = (data[:,0,i] >= 0) * (data[:,0,i] <= cycle_max)
        advs_attack_mode = (data[:,1,i] >= 0) * (data[:,1,i] <= cycle_max)
        hero_attempts_attack = (data[:,0,i] == cycle_max)
        advs_attempts_attack = (data[:,1,i] == 0)
        advs_unexpecting = (data[:,1,i] > cycle_max)
        hero_critical_attacks = (3 * N * hero_attempts_attack * np.random.binomial(1, p_c_h + (p_c_h_u * advs_unexpecting), num_exp))
        advs_critical_attacks = (3 * N * advs_attempts_attack * np.random.binomial(1, p_c_a, num_exp)) 
    
        # compute intermediate values: current vals - critical attack + reset cycle if hit bottom - 1 (if not dead or at bottom of counter) 
        hero_vals = data[:,0,i] - advs_critical_attacks + ((data[:,0,i] == 0) * cycle_max) - (data[:,0,i] > 0)
    
        # stay dead, or go into battle mode if not already AND [(have perception AND adversary is in battle mode) OR adversary just attacked OR hero-mode says should] 
        no_perception = (1-intention_perception)
        enter_attack_mode =  np.maximum(
                            np.maximum(advs_attack_mode * intention_perception, 
                                no_perception * advs_attempts_attack * (1 - (hero_mode == hero_decision_modes['NEVER']))),
                            np.maximum(no_perception * (hero_mode == hero_decision_modes['ALWAYS']) * np.ones(num_exp),
                                no_perception * (hero_mode == hero_decision_modes['RANDOM']) * np.random.binomial(1, probRandAttack, num_exp)))
        data[:,0, i+1] = np.minimum(hero_vals, (1 - enter_attack_mode) * hero_vals + enter_attack_mode * cycle_max)
    
        # compute intermediate values: current vals - critical attack + reset cycle if hit bottom - 1 (if not dead or at bottom of counter) 
        advs_vals = data[:,1,i] - hero_critical_attacks + ((data[:,1,i] == 0) * cycle_max) - (data[:,1,i] > 0)
    
        # stay dead, or go into battle mode if not already AND (detect OR hero is in battle mode, which means hero already attacked)
        detect = np.random.binomial(1, p_d, data.shape[0])
        enter_attack_mode = np.maximum(detect, hero_attack_mode) * (1 - advs_attack_mode)
        data[:,1,i+1] = np.minimum(advs_vals, (1 - enter_attack_mode) * advs_vals + enter_attack_mode * cycle_max)
    
    return inputs, data