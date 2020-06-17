import numpy as np

hero_decision_modes = {
            'NEVER' : 0,
            'ALWAYS' : 1,
            'RANDOM' : 2,
            'RETALIATE': 3,
            'INTENTION': 4
        }

# Params
N = 10
p_d = 0.1
p_c_a = 0.7
p_c_h = 0.5
p_c_h_u = 0.2
prob_hero_random_attack = 0.2
cycle = 3
cycle_max = cycle - 1
num_exp = 1000000
hero_mode = hero_decision_modes['INTENTION']
intention_perception = (hero_mode == hero_decision_modes['INTENTION'])

# Set up matrix to hold values (should probably be 3D tensor, one slice saving each iteration...)
Z = np.ones((num_exp, 2)) * 2 * N

# Run num_exp experiments for N iterations each 
for i in range(0, N):
    # Update state
    hero_attack_mode = (Z[:,0] >= 0) * (Z[:,0] <= cycle_max)
    advs_attack_mode = (Z[:,1] >= 0) * (Z[:,1] <= cycle_max)
    hero_attempts_attack = (Z[:,0] == cycle_max)
    advs_attempts_attack = (Z[:,1] == 0)
    advs_unexpecting = (Z[:,1] > cycle_max)
    hero_critical_attacks = (3 * N * hero_attempts_attack * np.random.binomial(1, p_c_h + (p_c_h_u * advs_unexpecting), num_exp))
    advs_critical_attacks = (3 * N * advs_attempts_attack * np.random.binomial(1, p_c_a, num_exp)) 
    
    # compute intermediate values: current vals - critical attack + reset cycle if hit bottom - 1 (if not dead or at bottom of counter) 
    hero_vals = Z[:,0] - advs_critical_attacks + ((Z[:,0] == 0) * cycle_max) - (Z[:,0] > 0)
    
    # stay dead, or go into battle mode if not already AND [(have perception AND adversary is in battle mode) OR adversary just attacked OR hero-mode says should] 
    no_perception = (1-intention_perception)
    enter_attack_mode =  np.maximum(
                            np.maximum(advs_attack_mode * intention_perception, 
                                no_perception * advs_attempts_attack * (1 - (hero_mode == hero_decision_modes['NEVER']))),
                            np.maximum(no_perception * (hero_mode == hero_decision_modes['ALWAYS']) * np.ones(num_exp),
                                no_perception * (hero_mode == hero_decision_modes['RANDOM']) * np.random.binomial(1, prob_hero_random_attack, num_exp)))
    Z[:,0] = np.minimum(hero_vals, (1 - enter_attack_mode) * hero_vals + enter_attack_mode * cycle_max)
    
    # compute intermediate values: current vals - critical attack + reset cycle if hit bottom - 1 (if not dead or at bottom of counter) 
    advs_vals = Z[:,1] - hero_critical_attacks + ((Z[:,1] == 0) * cycle_max) - (Z[:,1] > 0)
    
    # stay dead, or go into battle mode if not already AND (detect OR hero is in battle mode, which means hero already attacked)
    detect = np.random.binomial(1, p_d, Z.shape[0])
    enter_attack_mode = np.maximum(detect, hero_attack_mode) * (1 - advs_attack_mode)
    Z[:,1] = np.minimum(advs_vals, (1 - enter_attack_mode) * advs_vals + enter_attack_mode * cycle_max)

# Show quick computed stats
hpro = np.sum(Z[:,0] >= 0) / num_exp
apro = np.sum(Z[:,1] >= 0) / num_exp
print("Hero Attack Decision Mode:", list(hero_decision_modes.keys())[list(hero_decision_modes.values()).index(hero_mode)])
print("Heroes Survived (pct):", "{:.2f}".format(100 * hpro), "+/-", "{:.3f}".format(196 * np.sqrt((hpro * (1-hpro))/num_exp)))
print("Advers Survived (pct):", "{:.2f}".format(100 * apro), "+/-", "{:.3f}".format(196 * np.sqrt((apro * (1-apro))/num_exp)))


#==============================================

''' TODO:
    1) Wrap in a function, and make callable from the command line, taking in parameters as arguments. 
    2) Turn matrix into tensor (i.e., shape=(num_exp, 2, N)), and store each iteration as a slice in the tensor.
    3) At the end of the runs, save the tensor to a CSV output. Each even row should be the N values for a single experiment run for a hero, 
       and every odd row should be the N values for a run for an adversary. Thus, pairs of rows for each experiment run, where the columns
       are the values at each iteration.
    4) Create code to read in a CSV file and compute statistics from it.
    5) Create code to read in a CSV file and extract a given run from it.
    6) Create a SIMPLE graphical front end that takes in a run from the CSV file, and turns it into a simple progression of pictures.
       This should look like old first-person dungeon crawler games, where a monster / droid is in front of your, and you're looking
       at them. If perception is on, you can see they have one of two expressions (angry or calm). If it is off, their face should be
       a circle with question mark in the middle. When they attack, it should have a simple animation (fireball? claw mark? red lazer?) that shows
       an attack was done. If the adversary attack is critical and the hero dies, grey out the pictures. If the hero attacks (sword slash?
       blue lazer?) and it kills the adversary, the adversary picture should look dead/blown up/etc. (I'm guessing this can be done either
       with simple javascript + HTML or with pygame or something similar. Don't need Unity for this! :))
'''
