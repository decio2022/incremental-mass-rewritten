const GUIDE_STATE = {
    query: "",
    searchAll: false,
    showStatus: true,
    lastRenderKey: "",
    lastTrackerKey: "",
    lastCheckKey: "",
};

const GUIDE_CHAPTERS = [
    {
        id: 0,
        title: "Roadmap & Core Mechanics",
        subtitle: "Complete progression order from 0 g to eee100 g, plus softcaps, scalings, overflows, and reset etiquette.",
        accent: "guide",
        targetTab: 0,
        targetStab: 0,
        cards: [
            {
                title: "Full Game Progression Order (Phases 1–11)",
                tags: "overview roadmap progression phases order start end",
                type: "table",
                headers: ["Phase", "Unlock Trigger", "Core Loop & Main Objective", "Sub-Tab"],
                rows: [
                    ["1. Ranks & Rage", "Start at 0 g → 1e15 g", "Buy Mass Upgrades 1–3, climb Ranks & Tiers, enter Rage Power (1e15 g), buy Tickspeed & RP QoL upgrades.", "Ranks & Main (1)"],
                    ["2. Black Hole & Challenges", "1e20 RP → 1.5e136 g", "Reset for Dark Matter, build Black Hole Mass & Condensers, push Challenges C1–C8, unlock Elements at C7×16.", "BH & Upgrades (2) / Challenges (3)"],
                    ["3. Atom & Mass Dilation", "1.5e156 g (1 uni) BH Mass", "Gain Atoms & Quarks, assign Protons/Neutrons/Electrons, buy Elements 1–20, unlock Mass Dilation at Element 21.", "Atom & MD (4)"],
                    ["4. Stars & Supernova", "Element 36 → 1e90 Stars", "Grow Star Generators 1–5, hit Supernova, rush QoL & Challenge Tree nodes, reach SN 10 for Bosons & C10 for Fermions.", "Stars & SN (5)"],
                    ["5. Radiation & Quantum Prep", "Tree [unl1] → C12 + mlt(1e4)", "Climb 7 Wavelengths in Radiation, push SN & Stars to mlt(1e4) mass after C12, perform your first Quantum reset.", "Stars & SN (5) / Quantum (7)"],
                    ["6. Quantum, QC & Entropy", "1+ Quantizes", "Pick Chroma (Green early), push Quantum Challenges for Shards, allocate Primordium Theorems, evaporate Entropy at mlt(7.5e6).", "Quantum (7)"],
                    ["7. Big Rip & Break Dilation", "Tree [unl4] + [br9]", "Enter Big Rip (QC [10,2,10,10,5,0,2,10]), farm Death Shards, buy Big Rip Upgrade 9, push Relativistic Energy/Mass.", "Quantum (7) / Atom & MD (4)"],
                    ["8. Infinity & Eternity", "1.79e308 Quantum Foam", "Go Infinity (boosted heavily by Big Rip Death Shards!), unlock Eternity at Inf Upg 14, farm Timeshards & C13–C20.", "Inf & Eternity (8)"],
                    ["9. Galaxies, GC & Clusters", "Element 218 (1e6 SN) → 100 SG", "Push Supernova Galaxies (SG 1–13+), conquer Galactic Challenges, unlock G-Particles/G-Fermions, climb Clusters.", "Galaxy & SC (6)"],
                    ["10. Exotic, Dark Run & Beyond Ranks", "Element 359 + ee1e12 g", "Reset for Exotic Matter, invest in RCB & Exotic Boosts, master Darkness & Dark Run (QC [30×8] + GC D8), climb Enne/Beyond Ranks.", "Exotic & Axions (9)"],
                    ["11. The Matters, Axions & Endgame", "Element 486 → Element 556 → eee100 g", "Chain all 13 Matters, farm FSS, charge Tier 1–4 Elements, run Axion Generators & Axionic Tree, clear ax42 & C24.", "Exotic & Axions (9)"],
                ],
            },
            {
                title: "Universal Mechanics: Softcaps, Overflows & Scalings",
                tags: "softcap overflow scaling super hyper ultra meta exotic global speed",
                body: `
                    <ul class="guide_list">
                        <li><b>Softcaps (<code>softcap</code> / <code>softcap^n</code>):</b> Slows down growth past a threshold (usually raising excess to a root or fractional power). Look for Ranks, Hex, Elements, Prestige Mass, and Upgrades that either <b>delay softcap starts</b> or <b>weaken softcap strength</b>.</li>
                        <li><b>Overflow:</b> A harsher logarithmic/exponential compression (like Mass Overflow starting around <code>ee84 g</code>, Black Hole Overflow, Stronger Overflow, Star Overflow). Unlike normal softcaps, Overflow often needs dedicated upgrades (like <b>Challenge 15</b> reward, <b>Exotic Upgrade 1</b>, <b>Atom Upgrade 24</b>, or <b>Prestige Dark Matter</b>).</li>
                        <li><b>Cost/Req Scalings:</b> Resources climb through <code>Super</code> → <code>Hyper</code> → <code>Ultra</code> → <code>Meta</code> → <code>Exotic</code> tiers. Whenever you hit a wall, check <b>Stats → Rewards & Scaling</b> to see which tier just triggered!</li>
                        <li><b>Pre-Quantum Global Speed (GS):</b> Multiplies time/tick speed for almost all pre-Quantum resources (Mass, RP, DM, BH, Atoms, Quarks, Bosons, Radiation, Neutron Stars). Prioritizing GS multipliers (Blueprint Particles, Timeshards, Supernova Galaxies, Prestiges) accelerates every earlier system at once.</li>
                    </ul>
                `,
                callout: { kind: "tip", text: "Use the dedicated <b>Stats</b> tab (next to Guide) anytime to inspect active softcaps, scaling thresholds, and locked milestones in real time." },
            },
            {
                title: "Quality-of-Life & Reset Checklist",
                tags: "qol auto offline notation confirm backup",
                body: `
                    <ul class="guide_list">
                        <li><b>Never hold onto manual resets past QoL:</b> Grab Rage Upgrade 3–6, BH Upgrade 4–6, Atom Upgrade 2/5/6, Neutron Tree <code>qol1–qol9</code>, and <code>qu_qol1–qu_qol13</code> as soon as possible.</li>
                        <li><b>Notation tip:</b> In <b>Options → Notations</b>, <code>Scientific</code> or <code>Mixed Scientific</code> makes comparing <code>1e100</code> vs <code>ee15</code> vs <code>Fe308</code> effortless. Mass Display defaults to auto-scaling units (<code>g</code> → <code>M☉</code> → <code>uni</code> → <code>mlt</code> → <code>mgv</code> → <code>arvs</code>).</li>
                        <li><b>Reset confirmations:</b> Keep confirmations ON for destructive resets (Quantum, Big Rip, Infinity, Eternity, Supernova Galaxy, Exotic, Cluster, FSS) until you have QoL upgrades that preserve your progress.</li>
                    </ul>
                `,
            },
        ],
        milestones: [
            { id: "m_rp", label: "Unlock Rage Power (1e15 g mass)", done: () => player.rp.unl, tab: 0, stab: 0 },
            { id: "m_bh", label: "Unlock Black Hole (enter with Dark Matter)", done: () => player.bh.unl, tab: 0, stab: 1 },
            { id: "m_atom", label: "Unlock Atom (1.5e156 g BH mass)", done: () => player.atom.unl, tab: 4, stab: 0 },
            { id: "m_elem", label: "Unlock Elements (Challenge 7 × 16)", done: () => player.chal.comps[7].gte(16) || player.supernova.times.gte(1) || quUnl(), tab: 4, stab: 1 },
            { id: "m_md", label: "Unlock Mass Dilation (Element 21)", done: () => MASS_DILATION.unlocked(), tab: 4, stab: 2 },
            { id: "m_stars", label: "Unlock Stars (Element 36)", done: () => STARS.unlocked(), tab: 0, stab: 3 },
            { id: "m_sn", label: "Become Supernova (1e90 Collapsed Stars)", done: () => player.supernova.times.gte(1) || quUnl() || player.superGal.gte(1), tab: 5, stab: 0 },
            { id: "m_qu", label: "Go Quantum (C12 + mlt(1e4) mass)", done: () => quUnl(), tab: 6, stab: 0 },
            { id: "m_br", label: "Enter Big Rip (Tree unl4)", done: () => player.qu.rip.first || player.inf.times.gte(1) || player.exotic.times.gte(1), tab: 0, stab: 4 },
            { id: "m_inf", label: "Go Infinity (1.79e308 Quantum Foam)", done: () => player.inf.times.gte(1) || player.exotic.times.gte(1), tab: 0, stab: 4 },
            { id: "m_et", label: "Go Eternity (Inf Upg 14 + 1e2000 GS)", done: () => player.et.times.gte(1) || player.exotic.times.gte(1), tab: 0, stab: 5 },
            { id: "m_sg", label: "Supernova Galaxy (Element 218 + 1e6 SN)", done: () => player.superGal.gte(1) || player.exotic.times.gte(1), tab: 5, stab: 4 },
            { id: "m_ex", label: "Go Exotic (Element 359 + ee1e12 g)", done: () => player.exotic.times.gte(1), tab: 7, stab: 0 },
            { id: "m_sc", label: "Supernova Cluster (Element 387 + 100 SG)", done: () => player.superCluster.gte(1), tab: 5, stab: 6 },
            { id: "m_mat", label: "Unlock The Matters (Element 486)", done: () => hasElement(486), tab: 7, stab: 5 },
            { id: "m_ax", label: "Unlock Axionic Tree (Element 556)", done: () => hasElement(556), tab: 5, stab: 0 },
            { id: "m_end", label: "Reach eee100 g & unlock Final 6 / C24 (Tree ax42)", done: () => hasTree("ax42") && player.mass.gte("eee100"), tab: 3, stab: 0 },
        ],
    },
    {
        id: 1,
        title: "Ranks, Mass Upgrades, Prestiges & Ascensions",
        subtitle: "Every tier in Main → Ranks/Prestiges/Ascensions, Mass Upgrades 1–4, Tickspeed, Accelerator, and Beyond Ranks.",
        accent: "normal",
        targetTab: 0,
        targetStab: 0,
        cards: [
            {
                title: "Mass Upgrades & Tickspeed Loop",
                tags: "muscler booster stronger overpower tickspeed accelerator prestige mass",
                body: `
                    <ul class="guide_list">
                        <li><b>Mass Upgrades 1–3:</b> <b>Muscler</b> (flat base mass), <b>Booster</b> (mass multiplier), <b>Stronger</b> (exponent boost to mass). Early on, alternate buying all three until BH Upgrade 1 makes them stop spending mass.</li>
                        <li><b>Mass Upgrade 4 (Overpower):</b> Unlocked by <b>Exotic Upgrade 3</b> (<code>hasUpgrade('exotic', 3)</code>). Gives a powerful late-game mass exponent multiplier, boosted further by <b>Prestige Overpower</b> via Exotic Upgrade 6/7/9/14/16/23!</li>
                        <li><b>Tickspeed & Accelerator:</b> Tickspeed multiplies mass gain (later turns into an exponent boost at <b>Element 134</b>!). Element 134 also unlocks <b>Accelerator</b>, which raises Tickspeed's power/effect exponentially.</li>
                    </ul>
                `,
            },
            {
                title: "Rank Hierarchy: Rank → Enne → Beyond Ranks",
                tags: "rank tier tetr pent hex hept oct enne beyond ranks dec hect",
                type: "table",
                headers: ["Tier", "How It Unlocks", "Standout Rewards & Breakpoints"],
                rows: [
                    ["Rank", "Start of game", "R1–3 unlock Mass Upgrades 1–3; R6/17 massive mass boost; R40/90/220 boost Tickspeed Power; R300 boosts Quarks; R380/800 boost Mass & soften Softcap^1."],
                    ["Tier", "Rank 3 (or Atom 3 / Rad)", "T2 raises mass ^1.15; T4/12 boost Tickspeed Power; T6/8 boost RP; T30 weakens Stronger softcap."],
                    ["Tetr", "Atom Upgrade 3 (or Rad)", "Te1 reduces Tier req & weakens Hyper Rank; Te3 raises Tickspeed ^1.05; Te5/8 delay Hyper/Ultra Tickspeed & Mass Softcap^2."],
                    ["Pent", "Radiation unlocked (Tree unl1)", "P1 delays Meta-Rank; P2 boosts Radiation; P4 delays Meta-Tickspeed by SN; P8/15 delay Mass Softcap^4 & remove Stronger SC^3."],
                    ["Hex", "Prestige Level 42", "H1/4/8 remove Mass Softcaps 1/2/3! H5 boosts Prestige Base Exp; H1–118 mirror & buff Tier-1 Elements! H20 adds +100k C7 cap; H204 optimizes Star Power."],
                    ["Hept", "Glory 6 (Prestige Tier 2)", "Hp1/2 weaken Mass & Star Overflow! Hp6 boosts Pre-QU Global Speed; Hp40 cubes Red Chroma; Hp52 multiplies Entropy."],
                    ["Oct", "Glory 30", "O10 boosts Infinity & Eternal Mass; O34 multiplies Exotic Matter; O40+ scale deep post-Exotic stats."],
                    ["Enne & Beyond Ranks", "Renown 38 (Beyond at Enne 100)", "Enne 1/5/10/101/250/300 boost Prestige DM, Exotic Matter, Dark Shadow, Dark Ray, Stardust. At Enne 100+, Beyond Ranks (Dec, Icos, Hect...) emerge automatically!"],
                ],
                callout: { kind: "milestone", text: "Key QoL Milestones: RP Upg 4 (Rank keeps), BH Upg 4 (Tier keeps), Tree qol5 (Tetr keeps), Tree qol8 (Pent keeps), Honor 27 (Hex keeps), Glory 18 (Hept keeps), Renown 9 (Oct keeps), Renown 38 (ALL Ranks keep!)." },
            },
            {
                title: "Prestiges & Prestige Masses (Quantum+ Era)",
                tags: "prestige level honor glory renown valor prestige mass rp bh dm",
                body: `
                    <ul class="guide_list">
                        <li><b>Prestige Base:</b> Calculated from the product of all Rank tiers (Rank..Enne) raised to Prestige Base Exponent. Pushing Ranks directly fuels Prestige!</li>
                        <li><b>5 Prestige Tiers:</b>
                            <b>Prestige Level</b> (unlocked at Quantum) → <b>Honor</b> → <b>Glory</b> (Honor 12) → <b>Renown</b> (Glory 33) → <b>Valor</b> (Ascension 30 or Valor 1).
                        </li>
                        <li><b>Big Milestones:</b>
                            <b>P1–5</b> unlock massive Mass SC delays &amp; Pre-QU GS ^2; <b>P32</b> increases Prestige Base Exp; <b>P42</b> unlocks Hex; <b>P50</b> lets you buy Atom Upgs 13–15 outside Big Rip; <b>Honor 10</b> unlocks <b>Prestige Mass</b> (weakens pre-meta Tetr scalings); <b>Glory 165</b> unlocks <b>Prestige RP</b> (+Overpower Power); <b>Renown 34/37</b> unlock <b>Prestige BH &amp; DM</b> (weakens 2nd BH Overflow!).
                        </li>
                        <li><b>QoL Preservation:</b> Big Rip Upg 11 keeps Prestige Level on reset; Glory 2 keeps Honor; Supernova Galaxy 9 stops ALL Prestiges from resetting anything; Exotic Milestone 2 automates P/H/G/R; Cluster 6 automates Valor!</li>
                    </ul>
                `,
            },
            {
                title: "Ascensions & Ascension Mass (Exotic Era)",
                tags: "ascension transcension recursion ascension mass",
                body: `
                    <ul class="guide_list">
                        <li><b>Unlock:</b> Reach <b>Renown 23</b> to unlock <b>Ascension Level</b> (resets Exotic on manual reset until Supernova Cluster 2!).</li>
                        <li><b>Sub-Tiers:</b> <b>Ascension Level</b> → <b>Transcension Level</b> (Ascension 4) → <b>Recursion</b> (Transcension 20).</li>
                        <li><b>Ascension Mass (Transcension 3):</b> Directly adds to your <b>Prestige Base Exponent</b>! Combined with Ascension Mass Upgrades 1–3, this skyrockets Prestige Tiers and unlocks Valor (Ascension 30).</li>
                        <li><b>Automation via Clusters:</b> Supernova Cluster 2/11/20 remove resets for Ascension/Transcension/Recursion; Cluster 5/12/20 automate them passively!</li>
                    </ul>
                `,
            },
        ],
        milestones: [
            { id: "m_r_upgs", label: "Auto Mass Upgrades & Auto Rank/Tier (RP 3–6)", done: () => player.mainUpg.rp.includes(6), tab: 2 },
            { id: "m_r_tetr", label: "Unlock Tetr (Atom Upgrade 3)", done: () => hasUpgrade("atom", 3) || player.ranks.tetr.gte(1), tab: 0, stab: 0 },
            { id: "m_r_hex", label: "Unlock Hex (Prestige Level 42)", done: () => player.ranks.hex.gte(1) || player.prestiges[0].gte(42), tab: 0, stab: 0 },
            { id: "m_r_pmass", label: "Unlock Prestige Mass (Honor 10)", done: () => player.prestiges[1].gte(10), tab: 0, stab: 0 },
            { id: "m_r_asc", label: "Unlock Ascension (Renown 23)", done: () => hasPrestige(3, 23) || player.ascensions[0].gte(1), tab: 0, stab: 0 },
            { id: "m_r_beyond", label: "Enter Beyond Ranks (Enne 100+)", done: () => player.ranks.enne.gte(100), tab: 0, stab: 0 },
        ],
    },
    {
        id: 2,
        title: "Black Hole & Main Upgrades",
        subtitle: "Dark Matter resets, Black Hole Condensers, Overflows, and the highest-value buys across all 6 Main Upgrade trees.",
        accent: "bh",
        targetTab: 0,
        targetStab: 1,
        cards: [
            {
                title: "Dark Matter & Black Hole Basics",
                tags: "black hole dark matter condenser mass overflow",
                body: `
                    <ul class="guide_list">
                        <li><b>First Black Hole Reset:</b> Available at <b>1e20 Rage Power</b> (inside C7/10/14/19, DM comes directly from Mass above 1e180 g). Always reset once you can afford 1–2 Dark Matter and a few Black Hole Condensers.</li>
                        <li><b>Black Hole Loop:</b> Unspent/generated DM boosts early progress, while spent DM buys <b>BH Condensers</b>, multiplying BH Mass gain. Your BH Mass multiplies Normal Mass (and later powers Mass exponentially via <b>BH Upgrade 19</b>!).</li>
                        <li><b>BH Overflow & 2nd Overflow:</b> At high BH mass, Overflow suppresses BH gain. Fight it using <b>BH Upgrades 16, 20, 23</b>, <b>Prestige Dark Matter (Renown 37)</b>, <b>Challenge 22</b> reward, and <b>Axionic Tree [ax34] / Quantum+ [qp39]</b>.</li>
                    </ul>
                `,
            },
            {
                title: "Priority Guide: Pre-Supernova Main Upgrades (RP, BH, Atom)",
                tags: "rage upgrades black hole upgrades atom upgrades priority",
                type: "table",
                headers: ["Tree", "Must-Have Early", "Mid-Game / Infinity Unlock (Inf 15)", "Exotic Unlock (Exotic 19)"],
                rows: [
                    ["Rage (rp)", "rp3 (Auto Mass Upg), rp4 (Rank keeps), rp5–6 (Auto Rank/Tier), rp9 (+0.25 Stronger), rp13/15 (C5 & Atom).", "rp16 (No Tickspeed Pow SC), rp18 (RP→Inf Mass), rp19 (Mass Overflow ^10 later), rp20 (Accelerator Power).", "rp21–25 (Overpower delay, RP→Tickspeed Pow, Gal Quarks boost)."],
                    ["Black Hole (bh)", "bh1 (Mass Upgs free), bh4 (Tier keeps), bh5 (Auto Tickspeed/RP Upg), bh6 (100% RP/s), bh10/13 (DM→Mass, ×10 Quarks).", "bh16–20 (BH Overflow delay, remove BH softcap, DM→Inf Mass, BH^exp→Mass).", "bh21–25 (DM→Condenser, Entropic Mult boost via Neut-Tau, BH→Exotic Matter)."],
                    ["Atom (atom)", "atom1 (Start w/ Mass Upgs), atom2 (Auto BHC/BH Upgs), atom3 (Tetr), atom4–6 (Keep C1–4, Auto Tetr, 100% DM/s), atom10 (½ Tier req).", "atom13–15 (Big Rip/P50 BHC & Cosmic Ray boosts), atom16 (More Elements), atom18–20 (Atoms→Inf Mass & Accelerator).", "atom21–25 (Quarks^exp, Star Gens, Gal Quarks, No Atomic Overflow, Element Tier 4!)."],
                ],
                callout: { kind: "warn", text: "Note: <b>Atom Upgrades 13–15</b> initially only appear while inside <b>Big Rip &amp; Break Dilation</b> until you reach <b>Prestige Level 50</b>, which makes them permanently purchasable and raises their cost by ^1/20000!" },
            },
            {
                title: "Priority Guide: Big Rip, Infinity & Exotic Main Upgrades",
                tags: "big rip upgrades infinity upgrades exotic upgrades priority",
                type: "table",
                headers: ["Tree", "Currency", "Critical Priority Order"],
                rows: [
                    ["Big Rip (br)", "Death Shards", "br1–4 (start H-1, ignore QC8 on Ranks/Upgs, DS→GS, start w/ Fermion T2) → br6/8 (start w/ Rad & 10% passive QF/DS) → <b>br9 (Unlock Break Dilation!)</b> → br11 (Prestige keeps) → br16–25 (Timeshards, C14 rework, Exotic boost, QF ^(16/9))."],
                    ["Infinity (inf)", "Infinity Mass", "inf1–5 (Keep Neutron Tree, Upgrades, Elements & boost QF/Mass) → inf11 (100% Inf Mass/s + 1 Inf/s!) → <b>inf14 (Unlock Eternity!)</b> → inf15 (Unlock Upgrades 16–20 across trees!) → inf21–25 (Exotic 19+ SG/Exotic boosts)."],
                    ["Exotic (exotic)", "Exotic Matter", "<b>exotic1</b> (Remove Mass & Star Overflow!) → exotic3–4 (Mass/Prestige Upg 4) → <b>exotic5</b> (Reset Count Boosters) → <b>exotic10</b> (Exotic Boosts) → <b>exotic15</b> (Darkness) → <b>exotic19</b> (Permanently keep ALL upgrades & unlock Upgs 21–25!)."],
                ],
            },
        ],
        milestones: [
            { id: "m_bh_keep", label: "BH Upgrade 6 (100% passive RP/sec)", done: () => hasUpgrade("bh", 6), tab: 2 },
            { id: "m_atom_keep", label: "Atom Upgrade 6 (100% passive DM/sec)", done: () => hasUpgrade("atom", 6), tab: 2 },
            { id: "m_br9", label: "Big Rip Upgrade 9 (Break Dilation unlocked)", done: () => hasUpgrade("br", 9), tab: 2 },
            { id: "m_inf11", label: "Infinity Upgrade 11 (Passive Infinity Mass)", done: () => hasUpgrade("inf", 11), tab: 2 },
            { id: "m_inf15", label: "Infinity Upgrade 15 (Unlock Upgs 16–20)", done: () => hasUpgrade("inf", 15), tab: 2 },
            { id: "m_ex19", label: "Exotic Upgrade 19 (Keep all upgrades forever)", done: () => hasUpgrade("exotic", 19), tab: 2 },
        ],
    },
    {
        id: 3,
        title: "Challenges (C1–C24)",
        subtitle: "Entry requirements, reset behavior, best completion order, and late-game Challenge 13–24 tactics.",
        accent: "normal",
        targetTab: 3,
        targetStab: 0,
        cards: [
            {
                title: "Pre-Quantum Challenges (C1–C12)",
                tags: "c1 c2 c3 c4 c5 c6 c7 c8 c9 c10 c11 c12 challenges",
                type: "table",
                headers: ["Challenge", "Reset & Restriction", "Goal & Strategy Tip"],
                rows: [
                    ["C1: Instant Scale", "DM reset. Super Ranks/Mass Upg start at 25; Super Tickspeed at 50.", "Enter right after unlocking Challenges (1.5e136 g) + early BH upgrades. Delays Super Rank & weakens Super Tickspeed scaling."],
                    ["C2: Anti-Tickspeed", "DM reset. Cannot buy Tickspeed.", "Do 1–2 runs after C1. Gives +7.5% Tickspeed Power per completion (huge!)."],
                    ["C3: Melted Mass", "DM reset. Mass Softcap /1e150 & stronger.", "Reward raises Mass gain (outside C3). Push alongside C1–C2 whenever stuck on Ranks."],
                    ["C4: Weakened Rage", "DM reset. RP^(1/10) + Mass Softcap /1e100.", "Raises Rage Power gain; pair with BH Upgrades before aiming for Atom."],
                    ["C5: No Rank", "Atom reset. Cannot rank up.", "Unlocks at Atom. Get RP Upg 13–14 & Element boosts first; weakens Rank reqs (later becomes Meta-Rank/Tier/Tetr/Pent/Hex/Hept delay!)."],
                    ["C6: No Tickspeed & BHC", "Atom reset. Cannot buy Tickspeed or BH Condenser.", "Push after early Elements & C5 comps. Boosts both Tickspeed & Condenser power."],
                    ["C7: No Rage Powers", "Atom reset. No RP; DM scales off Mass; stronger softcap.", "<b>CRITICAL GOAL: Reach 16 completions to unlock Elements!</b> Adds max comps to C1–C4."],
                    ["C8: White Hole", "Atom reset. Cannot buy BH Condensers & weakened BH.", "1st completion unlocks more Elements! Pushed easily once Elements 1–18 start rolling."],
                    ["C9–C10", "Supernova reset. C9 = No Stronger/Stronger Upgs; C10 = Mass Dilated!", "<b>Beat C10 once to unlock Fermions!</b> Make sure you have Neutron Tree <code>chal1–chal4b</code> and Stars running."],
                    ["C11–C12", "Supernova reset. C11 = Dilated + No BH/Condenser; C12 = No Atoms!", "<b>Beat C12 once to unlock Quantum!</b> Push C9–C12 whenever you get Neutron Tree Challenge cap upgrades or Green Chroma."],
                ],
                callout: { kind: "tip", text: "Tree <code>qol6</code> auto-completes active Challenges without needing to click Exit! Also, <b>Green Chroma</b> multiplies effective C1–C8 completions — always keep Green Chroma active when pushing pre-Quantum walls." },
            },
            {
                title: "Post-Infinity & Post-Eternity Challenges (C13–C20)",
                tags: "c13 c14 c15 c16 c17 c18 c19 c20 reality overflow logarithmic",
                type: "table",
                headers: ["Challenge", "Unlock & Reset", "Key Strategy & Important Unlock"],
                rows: [
                    ["C13: No Quantum", "Infinity reset. Cannot gain QF, Quantizes, Death Shards, Chromas, Blueprint Particles, or Entropy.", "Get 4+ comps to unlock 13 new Tier-2 Elements (including Element 134!). Outside Big Rip, raises Chroma gain & effect."],
                    ["C14: The Reality II", "Infinity reset + forces Big Rip & all C1–C12!", "Weakens Death Shard softcap (or raises DS gain with br22). Enter only after a solid Infinity Upgrade foundation."],
                    ["C15: Super Overflow", "Element 164. Infinity reset. Mass & BH Overflow start at 10!", "Delays Mass Overflow! Push completions periodically to push Mass past early overflow walls."],
                    ["C16: No Prestige Mass", "Element 168. Infinity reset (clears Prestige Mass).", "<b>Reach 3 completions to unlock 24 new Elements (up to 192+)!</b> Weakens 1st Prestige Mass softcap."],
                    ["C17: No Challenges", "Element 192. Eternity reset. C1–12 blocked, C13–16 disabled.", "<b>Reach 3 completions to unlock 13 more Elements!</b> Weakens C3–C4 softcap & Hardened C1–12 scaling."],
                    ["C18: No Infinity Mass", "Element 205. Eternity reset.", "<b>Reach 3 completions to boost Infinity Mass & unlock more Elements!</b>"],
                    ["C19: The Reality III", "Element 209. Eternity reset + all Challenges 1–18 applied at once!", "<b>Reach 8 completions to unlock the final Tier-2 Elements up to 218 (Supernova Galaxy)!</b>"],
                    ["C20: Logarithmical Mass", "Element 213. Eternity reset. Mass gain = log10(mass); GS capped at ee50 (until Element 558!).", "Massively raises Mass gain (<code>2^C20</code>). Keep pushing C20 after SG 10+ and Exotic! Note: Exotic Milestone 10 preserves C20 completions on Exotic reset."],
                ],
            },
            {
                title: "Endgame Challenges (C21–C24)",
                tags: "c21 c22 c23 c24 exotic dark run galactic challenge",
                type: "table",
                headers: ["Challenge", "Unlock", "Restriction & Reward"],
                rows: [
                    ["C21: No Supernova Galaxies", "Element 438", "Disables SG/Galactic effects (except QoL), traps you in GC Difficulty 10, caps C20 at ^e2e25. <b>Reward:</b> Delays Super Supernova Galaxies!"],
                    ["C22: No Black Hole", "Element 476", "No BH mass gain, GC Difficulty 12, C20 disabled. <b>Reward:</b> Weakens 2nd BH Overflow! (Tip: Element 482 lets Atoms scale from Mass in C22!)"],
                    ["C23: No Matters", "Element 545", "All 13 Matters have 0 effect, GC Difficulty 14, C20 disabled. <b>Reward:</b> Directly adds to <b>Matter Exponent</b> (+0.01 per comp)!"],
                    ["C24: The Hardest Difficulty", "Neutron Tree [qp40] (via ax42)", "Equivalent to Galactic Challenge Difficulty 20! <b>Reward:</b> Increases Exotic Matter gain formula exponent (+0.05 per comp)."],
                ],
            },
        ],
        milestones: [
            { id: "m_c7_16", label: "Complete Challenge 7 × 16 (Unlock Elements)", done: () => player.chal.comps[7].gte(16), tab: 3, stab: 0 },
            { id: "m_c10_1", label: "Complete Challenge 10 × 1 (Unlock Fermions)", done: () => player.chal.comps[10].gte(1), tab: 3, stab: 0 },
            { id: "m_c12_1", label: "Complete Challenge 12 × 1 (Quantum Unlock req)", done: () => player.chal.comps[12].gte(1), tab: 3, stab: 0 },
            { id: "m_c16_3", label: "Complete Challenge 16 × 3 (Tier-2 Elements wave)", done: () => player.chal.comps[16].gte(3), tab: 3, stab: 0 },
            { id: "m_c19_8", label: "Complete Challenge 19 × 8 (Unlock Element 218 path)", done: () => player.chal.comps[19].gte(8), tab: 3, stab: 0 },
            { id: "m_c24_1", label: "Enter & push Challenge 24 (Endgame)", done: () => player.chal.comps[24].gte(1), tab: 3, stab: 0 },
        ],
    },
    {
        id: 4,
        title: "Atom, Elements, Mass & Break Dilation",
        subtitle: "Quarks, Proton/Neutron/Electron ratios, Galactic Particles, all 4 Periodic Table Tiers, Element Charging, and Dilation.",
        accent: "atom",
        targetTab: 4,
        targetStab: 0,
        cards: [
            {
                title: "Atoms, Quarks & Particles Strategy",
                tags: "atom quark proton neutron electron cosmic ray gamma ray g-particles",
                body: `
                    <ul class="guide_list">
                        <li><b>Atom Reset (1.5e156 g BH Mass):</b> Wait until you gain at least 2–3 Atoms on your first reset (or 10+ if quick) so you get Quarks right away.</li>
                        <li><b>Particle Ratios:</b> Start with <b>1 : 1 : 1</b> (Green Protons : Yellow Neutrons : Red Electrons).
                            <br>• <b>Protons</b> boost Mass &amp; Cosmic Ray Power.
                            <br>• <b>Neutrons</b> boost Rage Power &amp; Mass.
                            <br>• <b>Electrons</b> boost Dark Matter &amp; Tickspeed Power.
                            <br>Keep them balanced once Element 30 automates passive Quark distribution (10% of Quarks/s each).
                        </li>
                        <li><b>Atomic Power &amp; Cosmic Rays:</b> Buy Cosmic Rays whenever affordable; Atomic Power grants huge numbers of free Tickspeeds (capped/overflowed until Atom Upgrade 24).</li>
                        <li><b>Galactic Particles (Element 251):</b> Unlocked in Atom → G-Particles. Uses <b>Galactic Quarks</b> (earned at SG 10+) into G-Protons, G-Neutrons, G-Electrons. Distribute evenly (<code>1:1:1</code>), or favor G-Electrons/Protons when pushing C20/Clusters!</li>
                    </ul>
                `,
            },
            {
                title: "Periodic Table Guide: Tiers 1–4 & Charging",
                tags: "elements tier 1 2 3 4 periodic table charge charging",
                type: "table",
                headers: ["Tier / Range", "Unlock Path", "Game-Changing Elements"],
                rows: [
                    ["Tier 1 (1–118)", "C7×16 → C8×1 → Elem 18 → MD → Stars → SN → Fermions → Rad → Prim → QC → Big Rip", "<b>e1</b> (better Quarks), <b>e14</b> (passive Quarks/s), <b>e18</b> (Auto Cosmic Rays), <b>e21</b> (Mass Dilation!), <b>e24</b> (passive Atoms/s), <b>e30</b> (passive Particles), <b>e36</b> (Collapsed Stars!), <b>e84</b> (C8/QC helper), <b>e103</b> (GS boost), <b>e118</b> (Oganesson — huge Quantum & Exotic milestone)."],
                    ["Tier 2 (119–218)", "Break Dilation (br9) + Atom 16 + C13×4, C16×3, C17×3, C18×3, C19×8", "<b>e134</b> (Accelerator + Tickspeed becomes exponent!), <b>e146/163/189</b> (Inf Mass multipliers), <b>e164/168/192/205/209/213</b> (unlock C15–C20!), <b>e195</b> (passive Eternity!), <b>e218</b> (Unlock Supernova Galaxies!)."],
                    ["Tier 3 (219–362)", "Supernova Galaxy 10 → e290 → e291 → Exotic 1", "<b>e237</b> (Galactic Fermions), <b>e251</b> (Galactic Particles), <b>e267</b> (Galactic Challenge), <b>e291</b> (Passive SN + Bulk SG!), <b>e359</b> (Exotic top-bar unlock!)."],
                    ["Tier 4 (363–558)", "Atom Upgrade 25 → e380 → e438 → e450 → e476 → e486 → SC 14 → e534 → e542 → e545", "<b>e380</b> (Charge Tier 1 Elements w/ Quarks!), <b>e387</b> (Supernova Clusters), <b>e414</b> (Abyssal Blot), <b>e450</b> (Dark Run), <b>e483</b> (Charge Tier 2+ Elements w/ Inf &amp; Et Mass!), <b>e486</b> (The Matters), <b>e534/540/554</b> (Axions), <b>e556</b> (Axionic Tree!), <b>e558</b> (Remove C20 GS cap!)."],
                ],
                callout: { kind: "tip", text: "<b>Element Charging:</b> Once you unlock <b>Element 380</b> (Tier 1 via Quarks) and <b>Element 483</b> (Tier 2+ via Infinity/Eternity Mass), re-check the Periodic Table! Charging early elements like <code>e1, e14, e23, e36, e42, e54, e67, e103, e118</code> gives absurd exponential jumps." },
            },
            {
                title: "Mass Dilation & Break Dilation",
                tags: "mass dilation break dilation relativistic particles energy mass",
                body: `
                    <ul class="guide_list">
                        <li><b>Mass Dilation (Element 21):</b> Clicking <b>Dilate Mass</b> triggers an Atom reset and nerfs pre-Atom gains (<code>expMult(0.8)</code>). Your <b>Relativistic Particles (RP)</b> gained scale off Dilated Mass peak — run short 5–15 second dilations whenever your mass increases by orders of magnitude, then buy <b>MD Upgrades</b> (priority: Upg 1–3, Upg 5 RP exponent, Upg 8–9 Stars &amp; Quarks).</li>
                        <li><b>Tree <code>qol3</code>:</b> Gives passive Relativistic Particles/sec outside Dilation so you rarely need to dilate manually later!</li>
                        <li><b>Break Dilation (Big Rip Upgrade 9):</b> Active inside Big Rip (or everywhere once you buy <b>Neutron Tree <code>qu_qol13</code></b>!). Generates <b>Relativistic Energy</b> from Dilated Mass (<code>>1e400</code> log), which generates <b>Relativistic Mass</b> for powerful <b>BD Upgrades 1–12</b> (notably <b>bd3</b> turning DM's effect into an exponent!).</li>
                    </ul>
                `,
            },
        ],
        milestones: [
            { id: "m_a_e14", label: "Buy Element 14 & 24 (Passive Quarks & Atoms)", done: () => hasElement(14) && hasElement(24), tab: 4, stab: 1 },
            { id: "m_a_e36", label: "Buy Element 36 (Collapsed Stars)", done: () => hasElement(36), tab: 4, stab: 1 },
            { id: "m_a_e134", label: "Buy Element 134 (Tickspeed^ & Accelerator)", done: () => hasElement(134), tab: 4, stab: 1 },
            { id: "m_a_e218", label: "Buy Element 218 (Supernova Galaxies)", done: () => hasElement(218), tab: 4, stab: 1 },
            { id: "m_a_e380", label: "Buy Element 380 (Charge Tier 1 Elements)", done: () => hasElement(380), tab: 4, stab: 1 },
            { id: "m_a_e483", label: "Buy Element 483 (Charge Tier 2+ Elements)", done: () => hasElement(483), tab: 4, stab: 1 },
        ],
    },
    {
        id: 5,
        title: "Stars, Supernova, Bosons, Fermions & Radiation",
        subtitle: "Collapsed Stars, Star Generators, Neutron Tree tabs, Bosons, U-Fermions, and Radiation frequencies.",
        accent: "sn",
        targetTab: 5,
        targetStab: 0,
        cards: [
            {
                title: "Collapsed Stars & Star Generators",
                tags: "stars collapsed star generator booster stellar mass",
                body: `
                    <ul class="guide_list">
                        <li><b>Unlock (Element 36):</b> Buy Generators #1–#5 using Quarks (<code>1e225</code> up to <code>e870</code>). Each generator produces the tier below it (<code>5 → 4 → 3 → 2 → 1 → Collapsed Stars</code>), which boost Mass gain enormously.</li>
                        <li><b>Tree [s1–s5] & Star Booster [s4]:</b> After unlocking Star Gen 5, Tree <code>s4</code> converts the unlock button into <b>Star Booster</b> (doubling all generators per level!). Big Rip Upg 5 drastically reduces Star Booster cost (<code>^0.1</code>).</li>
                        <li><b>Star Softcaps & Overflow:</b> Softcap starts at <code>e1000</code> (removed by Tree <code>s5</code>); Overflow starts at <code>ee43</code> (removed by Exotic Upgrade 1).</li>
                        <li><b>Stellar Mass (Supernova Cluster 21):</b> Unlocks Main → Stellar! Buy Stellar Generators with Stardust for massive endgame multipliers.</li>
                    </ul>
                `,
            },
            {
                title: "Supernova & Neutron Tree Strategy",
                tags: "supernova neutron star tree c qol chal unl bosons",
                type: "table",
                headers: ["SN Count", "Recommended Neutron Tree Order & Goal"],
                rows: [
                    ["SN 1–2", "Buy <b>[c]</b> (0.1 Neutron Stars/sec!) → <b>[qol1]</b>, <b>[qol2]</b>, <b>[qol3]</b>, <b>[qol4]</b> (keep Atom/MD/Elements QoLs!) → <b>[chal1]</b>, <b>[chal2]</b>."],
                    ["SN 3–9", "Grab <b>[m1]</b>, <b>[rp1]</b>, <b>[bh1]</b>, <b>[t1]</b>, <b>[s1–s3]</b>, <b>[qol5–qol7]</b> (keep Tetr, auto-complete challenges!), and <b>[sn1–sn3]</b> to speed up Neutron Stars."],
                    ["SN 10+", "Unlocks <b>Bosons</b> &amp; manual Supernova resets! Buy Post-Supernova tree nodes <b>[bs1–bs5]</b>, <b>[unl1]</b> (Radiation!), and push Challenge 10 to unlock <b>Fermions</b>."],
                    ["Quantum & Late Trees", "Use <code>Quantum</code> tab (<code>qu0–qu12</code>, <code>qc1–qc8</code>, <code>prim1–8</code>, <code>en1–2</code>, <code>br1–3</code>, <code>unl2–4</code>). Later unlock <b>Quantum+</b> (Charged Element 118) and <b>Axionic Tree</b> (Element 556 — respecable!)."],
                ],
            },
            {
                title: "Bosons, U-Fermions & Radiation",
                tags: "boson graviton higgs photon gluon w z fermion quark lepton radiation hz",
                body: `
                    <ul class="guide_list">
                        <li><b>Bosons (10 SN):</b> Gravitons speed up all Bosons; Higgs raises Gravitons; Photons &amp; Gluons have 4 upgrades each (prioritize Photon 1/4 &amp; Gluon 1/4); W+ boosts Mass; W− delays Mass Softcap^2; Z0 boosts Tickspeed Power.</li>
                        <li><b>U-Fermions (C10 × 1):</b> 6 <b>U-Quarks</b> (Up, Down, Charm, Strange, Top, Bottom) + 6 <b>U-Leptons</b> (Electron, Muon, Tau, Neutrino, Neut-Muon, Neut-Tau). Entering one forces a Supernova reset with a specific handicap while letting you gain tiers in that Fermion.
                            <br><b>Tip:</b> Rotate through every unlocked Quark/Lepton whenever your stats jump to stack tiers! Once you get Tree <code>qu_qol8</code>, normal U-Fermion tiers gain passively without even switching into them!
                        </li>
                        <li><b>Radiation (Tree [unl1]):</b> Frequency (Hz) boosts ALL Fermion gains and unlocks 7 wavelengths (<code>Radio</code> up to <code>Gamma-ray</code> at <code>1e49 Hz</code>). Always buy Amplitude/Velocity boosters on every wavelength (<code>Radio</code> → <code>Gamma-ray</code>) — each wavelength feeds the distance below it!</li>
                    </ul>
                `,
            },
        ],
        milestones: [
            { id: "m_sn1", label: "Reach 1st Supernova & buy Tree [c]", done: () => hasTree("c") || player.supernova.times.gte(1) || quUnl(), tab: 5, stab: 0 },
            { id: "m_sn10", label: "Reach 10 Supernovas (Unlock Bosons)", done: () => player.supernova.post_10 || player.superGal.gte(1), tab: 5, stab: 1 },
            { id: "m_sn_rad", label: "Buy Tree [unl1] (Unlock Radiation)", done: () => tmp.radiation.unl, tab: 5, stab: 3 },
            { id: "m_sn_qp", label: "Charge Element 118 (Unlock Quantum+ Tree)", done: () => hasChargedElement(118), tab: 5, stab: 0 },
        ],
    },
    {
        id: 6,
        title: "Supernova Galaxies, GC & Clusters",
        subtitle: "Supernova Galaxies (1–34+), Galactic Powers & Quarks, Galactic Challenges, Galactic Fermions, and Supernova Clusters.",
        accent: "sn",
        targetTab: 5,
        targetStab: 4,
        cards: [
            {
                title: "Supernova Galaxies (Element 218)",
                tags: "supernova galaxy sg galpow galactic power quarks",
                type: "table",
                headers: ["SG Count", "Major Unlock / Permanent QoL Milestone"],
                rows: [
                    ["SG 1", "Unlocks <b>Galactic Power</b> (from Neutron Stars -> Mass ^boost), +100 C1–C16 max caps, +48 starting QC Shards, keeps Elements 134/170/218, boosts GS/Mass/RP/Tickspeed/NS/Entropy/Inf."],
                    ["SG 2", "Chroma starts unlocked, Neutron Tree needs no branch reqs, starts with 4 Quantizes, multiplies Quantizes/Infinities/Eternities!"],
                    ["SG 5", "<b>Permanently keep Neutron Tree</b> across SG/Infinity/Eternity resets!"],
                    ["SG 6–7", "Unlocks <b>Galactic Atoms</b> (Quarks ^), <b>Galactic Dark Energy</b> (BH ^), and <b>Galactic Bosons</b> (Bosons ^)."],
                    ["SG 8–9", "<b>SG 8: Permanently keep all Elements!</b> SG 9: Unlocks <b>Galactic U-Fermions</b> &amp; <b>Galactic Radiation</b>; Prestiges reset nothing!"],
                    ["SG 10–13", "<b>SG 10: Keep Infinity Upgrades, unlock Element Tier 3 &amp; Galactic Quarks!</b> SG 11: Keep Prestiges! SG 13: Keep C13–C20 completions!"],
                    ["SG 34+", "Adds +100×(SG−30) C17–C20 max completions. At Element 291, SG gains bulk &amp; stops forcing tab jumps."],
                ],
                callout: { kind: "tip", text: "Right after hitting SG 1–4, you temporarily lose Prestiges and Elements on reset — grab SG 5 (keep Tree) → SG 8 (keep Elements) → SG 10 (Element Tier 3 &amp; Keep Inf Upgrades) → SG 11 (Keep Prestiges) as quickly as possible!" },
            },
            {
                title: "Galactic Challenges (Element 267) & Galactic Fermions (Element 237)",
                tags: "galactic challenge gc shards difficulty trapped galactic fermions",
                body: `
                    <ul class="guide_list">
                        <li><b>Galactic Challenge (GC):</b> Applies a massive tetration nerf (<code>10^^(slog(gain) - depth/8)</code>) to Pre-Quantum resources and GS, and softcaps Primordium Beta. Reach the Supernova goal (<code>1e6</code> initially, lower at higher depths/e300/e333) to earn <b>Galactic Shards</b>, which raise Galactic Power gains!</li>
                        <li><b>GC Push Strategy:</b> Increase <b>Difficulty</b> first when you easily overshoot the SN goal. Enable extra modifiers once unlocked for huge shard multipliers: <b>Trapped Challenges</b> (Element 290, +5%/tier), <b>Trapped U-Fermions</b> (Element 297, also lowers SN goal!), <b>Big Rip</b> (Element 332, ×2 Shards!), <b>No Exotic Boosts</b> (Element 423, ×1.1), <b>No G-Particles</b> (Element 435, ×1.1 &amp; max Diff 15!).</li>
                        <li><b>Galactic Fermions (Element 237):</b> Forcing a G-Quark or G-Lepton reset traps you in ALL corresponding U-Fermions + Challenge 13 (and disables Infinity/Eternity mass gain!). Their tiers scale off your U-Fermion tiers (<code>Up</code>, <code>Down</code>, ..., <code>Neut-Tau</code>) and grant massive exponential boosts (plus secondary <code>^exp</code> boosts at Element 503!).</li>
                    </ul>
                `,
            },
            {
                title: "Supernova Clusters (Element 387)",
                tags: "supernova cluster sc stardust galactic mass stellar",
                type: "table",
                headers: ["SC Count", "Key Unlocks & Benefits (Requires 100+ SG base)"],
                rows: [
                    ["SC 1–4", "Each SC gives ×3^SC Exotic Matter &amp; Galactic Quarks, +SC Super SG delay, +SC Exotic Boosts, +SC Inf base exp. SC 2 keeps Ascension Level; SC 3/4 multiply Dark Shadow &amp; Dark Ray."],
                    ["SC 5–9", "SC 5–6 automate Ascension &amp; Valor; SC 7 boosts Abyssal Blot &amp; Glyphic Mass; SC 8 boosts Exotic Resets; <b>SC 9 unlocks Galactic Mass</b> &amp; boosts Galactic Power!"],
                    ["SC 10–14", "SC 10 weakens Meta-Supernova; SC 11–12 keep/auto Transcension; SC 13 adds Matter Exponent; <b>SC 14 unlocks Stardust</b> (delays Super SG scaling!)."],
                    ["SC 20–30", "SC 20 automates Recursion &amp; boosts X/Y Axion Gen Power; <b>SC 21 unlocks Stellar Mass</b> &amp; Stardust buyable; SC 27 boosts Z Axion Gen; SC 28–30 give massive <code>10^10^(1.25×SC)</code> Entropy gain &amp; cap!"],
                ],
            },
        ],
        milestones: [
            { id: "m_sg1", label: "Reach 1st Supernova Galaxy", done: () => player.superGal.gte(1), tab: 5, stab: 4 },
            { id: "m_sg10", label: "Reach 10 Supernova Galaxies (Tier 3 Elements & Keep Inf)", done: () => player.superGal.gte(10), tab: 5, stab: 4 },
            { id: "m_gc", label: "Complete a Galactic Challenge (earn Galactic Shards)", done: () => player.gc.shard.gte(1), tab: 3, stab: 2 },
            { id: "m_sc1", label: "Reach 1st Supernova Cluster", done: () => player.superCluster.gte(1), tab: 5, stab: 6 },
            { id: "m_sc14", label: "Reach 14 Supernova Clusters (Stardust)", done: () => player.superCluster.gte(14), tab: 5, stab: 6 },
            { id: "m_sc21", label: "Reach 21 Supernova Clusters (Stellar Mass)", done: () => player.superCluster.gte(21), tab: 5, stab: 6 },
        ],
    },
    {
        id: 7,
        title: "Quantum, Chroma, QC, Primordium, Entropy & Big Rip",
        subtitle: "First Quantum run, Quantum Milestones up to 1e900, Chroma choices, QC presets, Primordium, Entropy & Big Rip.",
        accent: "qu",
        targetTab: 6,
        targetStab: 0,
        cards: [
            {
                title: "Quantum Foam, Milestones & Chroma",
                tags: "quantum foam quantizes milestones chroma red green blue",
                body: `
                    <ul class="guide_list">
                        <li><b>First Quantum (C12 + mlt(1e4) mass):</b> Spend Quantum Foam on <b>Cosmic Strings</b> (multiplies Blueprint Particles -> Pre-QU GS) and Quantum Tree nodes (<code>qu0–qu12</code>, <code>qf1–qf4</code>).</li>
                        <li><b>Early Quantum Milestones (1–10):</b> <b>1</b> (qol1–6 + Bosons/Fermions), <b>2</b> (no pre-QU tree reqs + 10× GS), <b>3</b> (keep challenge tree), <b>5</b> (keep qol8–9 + Radiation), <b>6</b> (2× QF), <b>8</b> (GS boosts BP &amp; Chroma), <b>10</b> (Auto-Quantum!).</li>
                        <li><b>Endgame Quantum Count Milestones:</b> Farmed via <b>Quantum Count Boosters (Exotic RCB)</b> &amp; Infinity Upgrades — key breakpoints at <code>1e255</code> (×3 Exotic), <code>1e275/1e303/1e600</code> (Meta-Pent delays), <code>1e295</code> (QF^1.5 &amp; ×5 Exotic), <code>1.79e308</code> (Inf formula &amp; +5 Super SG), <code>6.9e420</code> (Entropy Evap^2 -50%), <code>4.2e690</code> (Green Chroma → Pent), <code>1e900</code> (better Red Chroma).</li>
                        <li><b>Chroma Strategy:</b>
                            <br>• <b>Green (Hybridized Uran-Astatine):</b> Your #1 default pick! Multiplies effective C1–C8 completions (and later Pent at <code>4.2e690</code> Quantizes).
                            <br>• <b>Red (Pyro-Radioactive Plasma):</b> Boosts Cosmic Ray Power / late-game scaling when needed.
                            <br>• <b>Blue (Neutronium-0):</b> Boosts Meta-scaling delays (especially once Element 348/421/519 links C5/C7 to Blue Chroma!).
                            <br>Wait for Tree <code>qu_qol3/5/6</code> or <code>SG 2</code> to keep multiple Chromas rolling passively.
                        </li>
                    </ul>
                `,
            },
            {
                title: "Quantum Challenges (Tree [unl3]) & Primordium (Tree [unl2])",
                tags: "quantum challenge qc shards modifiers presets primordium theorems beta epsilon",
                body: `
                    <ul class="guide_list">
                        <li><b>Quantum Challenges (QC):</b> 8 modifiers (<code>0–10</code> normally, up to <code>50</code> with Tree <code>qc4</code>!). Total Quantum Shards gained = sum of active modifiers (+ bonus). Each Shard raises your Quantum Foam multiplier!</li>
                        <li><b>Modifier Danger Ranking (Easiest → Hardest):</b>
                            <br>1. <b>Ex-Challenge [5]</b> &amp; <b>Spatial Dilation [6]</b> — usually easiest to pump high first.
                            <br>2. <b>Black Dwarf [0]</b> &amp; <b>Hypertiered [2]</b> — moderate unless pushing deep Fermions/Stars.
                            <br>3. <b>Time Anomaly [1]</b> &amp; <b>Melted Interactions [3]</b> — slow down GS &amp; Bosons/Radiation.
                            <br>4. <b>Intense Catalyst [4]</b> &amp; <b>Extreme Scaling [7]</b> — harshest early; bump gradually (<code>2–5</code> first, then <code>8–10</code> after buying <code>qc1–qc8</code> &amp; Prestige boosts).
                        </li>
                        <li><b>Primordium Particles:</b> Earn Theorems from Blueprint Particles. Click <b>Give all random Particles</b>, then buy Tree <code>prim1–prim3</code> (unlocks Fermion/Radiation bonuses on Epsilon &amp; Theta) and <b><code>prim4–prim7</code></b> to zero out Delta/Omega/Alpha/Sigma weights so theorems funnel straight into <b>Epsilon [Ε], Theta [Θ], and Beta [Β]</b> (which delays Supernova scalings!). Tree <code>prim8</code> converts theorems automatically without RNG!</li>
                    </ul>
                `,
            },
            {
                title: "Entropy (mlt(7.5e6)) & Big Rip (Tree [unl4])",
                tags: "entropy enthalpy hawking radiation evaporation big rip death shards",
                body: `
                    <ul class="guide_list">
                        <li><b>Entropy Strategy:</b>
                            <br>• Toggle <b>Evaporate Frequency → Enthalpy</b> to permanently raise Entropy gain/sec (until your next Quantum reset).
                            <br>• Toggle <b>Evaporate Black Hole → Hawking Radiation</b> to raise your Entropy Cap!
                            <br>• Pulse each button briefly whenever your Frequency or BH Mass reaches a new order of magnitude, then disable evaporation so your Hz/BH recover. Prioritizing <b>Entropic Evaporation</b> increases evaporation speed exponentially!
                        </li>
                        <li><b>Big Rip Strategy:</b> Traps you in QC <code>10/2/10/10/5/0/2/10</code>, halves Primordium (and disables Epsilon), disables Entropy Rewards &amp; Tree <code>qu2/qu10</code>.
                            <br>• First Rip: Buy <b>Tree [br1]</b>, Elements <code>90</code> &amp; <code>94</code>, push mass above <code>e2e5 g</code> (<code>1e200,000 g</code>), and exit to claim <b>Death Shards</b>!
                            <br>• Buy <b>Big Rip Upgrades 1–8</b> (especially <code>br4</code>, <code>br5</code>, <code>br8</code> passive DS/QF), then <b>br9 (Break Dilation)</b>!
                            <br>• <b>Pro Tip:</b> Even after unlocking Infinity, remember to do a deep Big Rip run (or rely on <code>qu_qol12</code> + <code>Element 282</code> passive DS) because Death Shards multiply your Infinity Mass exponentially!
                        </li>
                    </ul>
                `,
            },
        ],
        milestones: [
            { id: "m_qu_auto", label: "10 Quantizes (Unlock Auto-Quantum)", done: () => player.qu.times.gte(10), tab: 6, stab: 2 },
            { id: "m_qu_prim", label: "Unlock Primordium (Tree unl2)", done: () => PRIM.unl(), tab: 6, stab: 3 },
            { id: "m_qu_qc", label: "Unlock Quantum Challenges (Tree unl3)", done: () => hasTree("unl3"), tab: 3, stab: 1 },
            { id: "m_qu_en", label: "Unlock Entropy (mlt(7.5e6) mass)", done: () => player.qu.en.unl, tab: 6, stab: 4 },
            { id: "m_qu_br", label: "Buy Break Dilation (Big Rip Upg 9)", done: () => hasUpgrade("br", 9), tab: 4, stab: 3 },
        ],
    },
    {
        id: 8,
        title: "Infinity & Eternity",
        subtitle: "Breaking the 1.79e308 Quantum Foam barrier, farming Death Shards for Infinity Mass, and Eternity Timeshards.",
        accent: "normal",
        targetTab: 0,
        targetStab: 4,
        cards: [
            {
                title: "Infinity Mass Mechanics & First Infinites",
                tags: "infinity mass death shards max_value 1.79e308 inf11",
                body: `
                    <ul class="guide_list">
                        <li><b>How to Unlock:</b> Reach <b>1.7977e308 (<code>Number.MAX_VALUE</code>) Quantum Foam</b>.</li>
                        <li><b>Crucial Formula Secret:</b> Infinity Mass scales on <code>(log_MAX(QF) * log_MAX(Death Shards))^Power</code> (plus multipliers from Mass, Prestige Mass, Entropy, Et, Gal Quarks). If your Death Shards are low on reset, your Infinity Mass will be tiny!
                            <br><b>Best First-Infinity Routine:</b> Before clicking the Infinity icon in the top bar, hop into <b>Big Rip</b> for a few seconds to push your Death Shards well above <code>1.8e308</code>, exit Big Rip (optional if QF is capped), and then Go Infinity!
                        </li>
                        <li><b>Infinity Upgrades Path:</b> Grab <b>inf1</b> (note: actual cost is <code>1 mg</code> Infinity Mass!), <b>inf2–5</b> (keep Neutron Tree, Upgrades, Quantum Shards, and Elements across Infinity resets!), push to <b>inf11</b> (100% passive Infinity Mass/sec + 1 Infinity/sec), then <b>inf14</b> (Unlocks Eternity!).</li>
                    </ul>
                `,
                callout: { kind: "warn", text: "Infinity resets Quantum, Neutron Tree (until inf2), Elements (until inf5), and Challenges 9–12. Make sure <b>inf1–5</b> are your very first purchases so resets become instant and painless!" },
            },
            {
                title: "Eternity & Timeshard Generators",
                tags: "eternity mass timeshards shard generator global speed inf14 e195 e220",
                body: `
                    <ul class="guide_list">
                        <li><b>How to Unlock:</b> Buy <b>Infinity Upgrade 14</b> (<code>6e12</code> Infinity Mass), then push your <b>Pre-Quantum Global Speed</b> past <b>1e2000</b>!</li>
                        <li><b>Main -> Eternal Sub-tab:</b> Eternity resets everything Infinity does plus Infinity Mass/Times (starting at 1 Inf), and gives <b>Eternal Mass</b>. Use Eternal Mass to buy <b>Shard Generators</b>, which passively produce <b>Timeshards</b>!</li>
                        <li><b>Why Timeshards Matter:</b> Timeshards raise your Pre-Quantum Global Speed to a huge power (<code>calcShardsEffect()</code>), which in turn increases Eternal Mass, Blueprint Particles, Entropy, and lets you push past <code>e1e88</code>+ costs into <b>Infinity Upgrade 15</b> (<code>rp/bh/atom</code> 16–20), <b>C15–C20</b>, and eventually <b>Element 218 (Supernova Galaxies)</b>!</li>
                        <li><b>Automation:</b> <b>Element 195</b> passively generates Eternal Mass &amp; Eternities/sec; <b>Element 220</b> automatically buys Shard Generators for you.</li>
                    </ul>
                `,
            },
        ],
        milestones: [
            { id: "m_inf_1", label: "Reach 1st Infinity (1.79e308 QF)", done: () => player.inf.times.gte(1) || player.exotic.times.gte(1), tab: 0, stab: 4 },
            { id: "m_inf_11", label: "Buy Infinity Upgrade 11 (Passive Infinity Mass)", done: () => hasUpgrade("inf", 11), tab: 2 },
            { id: "m_inf_14", label: "Buy Infinity Upgrade 14 (Unlock Eternity)", done: () => hasUpgrade("inf", 14), tab: 2 },
            { id: "m_et_1", label: "Reach 1st Eternity (1e2000 GS)", done: () => player.et.times.gte(1) || player.exotic.times.gte(1), tab: 0, stab: 5 },
            { id: "m_et_auto", label: "Buy Element 195 & 220 (Passive Et + Auto Shard Gen)", done: () => hasElement(195) && hasElement(220), tab: 4, stab: 1 },
        ],
    },
    {
        id: 9,
        title: "Exotic, Darkness, Dark Run, The Matters & Axions",
        subtitle: "Exotic Resets, RCB, Exotic Boosts, Dark Ray/Shadow/Blot, Dark Run, all 13 Matters, FSS, Axions, Axionic Tree & eee100.",
        accent: "red",
        targetTab: 7,
        targetStab: 0,
        cards: [
            {
                title: "Exotic Resets, RCB & Exotic Boosts",
                tags: "exotic matter milestones rcb reset count booster exotic boost meta-boost",
                body: `
                    <ul class="guide_list">
                        <li><b>Going Exotic (Element 359 + ee1e12 g mass):</b> Exotic resets all Supernova Galaxies (starts at SG 10 until Milestone 10 → SG 15), Galactic resources, C1–C20, and Prestige Mass.
                            <br>• <b>Exotic Milestones:</b> <code>1</code> (keep Elements + SG 10), <code>2</code> (auto P/H/G/R), <code>4–5</code> (keep G-Fermion tiers &amp; Galactic Shards), <code>10</code> (SG 15 + keep C20), <code>50</code> (auto SG without reset!).</li>
                        <li><b>Reset Count Boosters (Exotic Upg 5):</b> Spend Exotic Matter on <b>Quantum, Infinity, Eternity, and Exotic (Element 402) Count Boosters</b>! Especially <b>Quantum Count Booster</b> unlocks endgame Quantum Milestones up to <code>1e900</code>!</li>
                        <li><b>Exotic Boosts (Exotic Upg 10+):</b> Gain 1 Boost Point per 3 OoMs of Exotic Matter (+ free points from Supernova Clusters!). Invest in:
                            <b>Mass</b>, <b>Dark Matter</b> (Exotic 11), <b>Atom</b> (Exotic 18), <b>Star</b> (Exotic 20), <b>Supernova</b> (Exotic 24), <b>Quantum</b> (Exotic 25), and <b>Exotic Meta-Boost</b> (adds levels to ALL other boosts!).
                            <br><b>Optimal Split:</b> Always invest heavily into <b>Exotic Meta-Boost</b> once unlocked (<code>Element 390</code> upgrades Meta-Boost from <code>log10</code> to a power formula!), and spread remaining points across the others (use Import/Export from Exotic Upg 25 to tweak builds!).
                        </li>
                    </ul>
                `,
            },
            {
                title: "Darkness & Dark Run (Element 450)",
                tags: "darkness dark ray dark shadow abyssal blot dark run glyphic mass",
                body: `
                    <ul class="guide_list">
                        <li><b>Darkness (Exotic Upg 15):</b> Generates <b>Dark Ray</b> (boosted by Exotic resets &amp; DS) and <b>Dark Shadow</b> (boosted by Dark Ray). At <b>Element 414</b>, unlock <b>Abyssal Blot</b>! These three mutually scale each other, plus unlock boosts to Blueprint Particles, Entropy, Eternal Mass, Exotic Matter, and Matter Exponent!</li>
                        <li><b>Dark Run (Element 450):</b> Entering Dark Run forces an Exotic reset and traps you inside <b>QC [30,30,30,30,30,30,30,30] + Galactic Challenge Difficulty 8</b>! You earn <b>Glyphic Mass</b> based on your peak mass while inside Dark Run (<code>10^((slog(mass+1000)-2)^10 - 3)</code>).
                            <br><b>How to Play Dark Run:</b> Do quick runs whenever your normal Exotic/Cluster/Matter progress increases, buy Glyphic Mass upgrades (<code>dr_upg 0–15</code>: prioritize double GM, <code>dr_upg 4</code> for 100% passive Exotic Resets/s, <code>dr_upg 6</code> weakening GC nerf, <code>dr_upg 7</code> GC Shards, <code>dr_upg 9</code> Abyssal Blot, <code>dr_upg 11</code> Exotic Boosts, and <code>dr_upg 15</code> Matter Exponent!), then exit Dark Run to resume normal pushing.
                        </li>
                    </ul>
                `,
            },
            {
                title: "The 13 Matters & Final Star Shards (Element 486)",
                tags: "matters red pink magenta purple violet blue cyan green lime yellow orange white fading fss",
                type: "table",
                headers: ["Matter", "Effect", "Key Synergy"],
                rows: [
                    ["Red → Pink → Magenta", "Red: ×Exotic Matter; Pink: Weakens Meta-SN; Magenta: +Base Et Mass exp.", "Each Matter gain scales from <code>slog(previous matter)</code> raised to <b>Matter Exponent</b> (start at Dark Matter -> Red -> ... -> Fading)."],
                    ["Purple → Violet → Blue", "Purple: ×Galactic Quarks; Violet: +Prestige Base exp; Blue: Stronger Atom Boost.", "Element 517 links Purple Matter to Stardust gain."],
                    ["Cyan → Green → Lime", "Cyan: Stronger SN Boost; Green: QF ^exp; Lime: +Ascension Base exp.", "Tree [qp10], [qp17], Exotic Matter (e487), SC 13, C23, and ax5/22/35/38 push Matter Exponent higher!"],
                    ["Yellow → Orange → White → Fading", "Yellow: Stronger DM Boost; Orange: +Base Inf exp; White: ×Abyssal Blot; Fading: ×Dark Ray.", "<b>Element 548</b> adds <code>(next matter)^(FSS/100)</code> forward feedback down the entire chain!"],
                    ["Final Star Shards (FSS)", "Resets Matters, Exotic Matter, Prestige Mass &amp; forces a Cluster reset; boosts ALL Axion Generators Power!", "Wait until your FSS Base (<code>sum of log10(log10(matter))</code>) crosses <code>40 × 1.1^FSS</code>, then reset and climb Matters back quickly."],
                ],
            },
            {
                title: "Axions, Axionic Tree & Endgame (eee100 g)",
                tags: "axion x y z w axionic space tree ax42 c24 eee100",
                body: `
                    <ul class="guide_list">
                        <li><b>Axion Generators:</b>
                            <b>X Axions</b> (Element 534 → Exotic Matter) → <b>Y Axions</b> (Element 540 → Dark Ray) → <b>Z Axions</b> (Element 554 → Stardust + unlocks <b>Axionic Space</b>) → <b>W Axions</b> (Axionic Tree <code>ax20</code> → Glyphic Mass).
                        </li>
                        <li><b>Axionic Tree (Element 556):</b> Costs <b>FSS</b> and can be <b>Respecced</b> anytime in Supernova → Neutron Tree! Use early upgrades (<code>ax1–ax13</code>) to skyrocket Axionic Space, FSS power (<code>ax7</code>), Matter Exponent (<code>ax5</code>, <code>ax9</code>, <code>ax16</code>), and Axion Generators (<code>ax11</code>, <code>ax30</code>), then climb all 42 nodes (<code>ax14–ax41</code>).</li>
                        <li><b>Final Endgame Push (<code>ax42</code> &amp; <code>C24</code>):</b>
                            Reach <b><code>eee100 g</code> Mass</b> and 41 Axionic Tree upgrades to buy <b><code>[ax42]</code></b>! This unlocks the final 6 upgrades in the <b>Quantum+</b> Neutron Tree tab (<code>qp38–qp41</code>), culminating in <b><code>[qp40]</code> → Challenge 24 (The Hardest Difficulty)</b>!
                        </li>
                    </ul>
                `,
            },
        ],
        milestones: [
            { id: "m_ex_1", label: "Perform 1st Exotic Reset (Element 359)", done: () => player.exotic.times.gte(1), tab: 7, stab: 0 },
            { id: "m_ex_dark", label: "Unlock Darkness (Exotic Upg 15) & Abyssal Blot (e414)", done: () => hasUpgrade("exotic", 15) && hasElement(414), tab: 7, stab: 3 },
            { id: "m_ex_dr", label: "Enter Dark Run (Element 450)", done: () => hasElement(450) && player.exotic.dark_run.points.gt(0), tab: 7, stab: 4 },
            { id: "m_ex_mat", label: "Unlock all 13 Matters & reset for 1st FSS", done: () => hasElement(486) && player.exotic.fss.gte(1), tab: 7, stab: 5 },
            { id: "m_ex_ax", label: "Unlock Axionic Space & Axionic Tree (e554 / e556)", done: () => hasElement(556), tab: 7, stab: 6 },
            { id: "m_ex_final", label: "Buy [ax42] at eee100 g & unlock Challenge 24", done: () => hasTree("ax42") && hasTree("qp40"), tab: 5, stab: 0 },
        ],
    },
];

function gSafe(fn, fallback = false) {
    try {
        const v = fn();
        return (v === undefined || v === null) ? fallback : v;
    } catch (e) {
        return fallback;
    }
}

function gEsc(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function isGuideGameTabUnlocked(tabIdx) {
    if (tabIdx === undefined || tabIdx === null) return false;
    if (tabIdx === 0 || tabIdx === 1 || tabIdx === 8 || tabIdx === 9 || tabIdx === 10) return true;
    const t = TABS[1][tabIdx];
    return t ? (t.unl ? !!gSafe(() => t.unl(), false) : true) : false;
}

function jumpToGuideGameTab(tabIdx, stabIdx = 0) {
    if (!isGuideGameTabUnlocked(tabIdx)) return;
    TABS.choose(tabIdx);
    if (TABS[2][tabIdx] && TABS[2][tabIdx][stabIdx]) {
        const st = TABS[2][tabIdx][stabIdx];
        if (!st.unl || gSafe(() => st.unl(), false)) {
            TABS.choose(stabIdx, true);
        }
    }
}

function jumpToGuideSubTab(subIdx) {
    if (subIdx < 0 || subIdx >= GUIDE_CHAPTERS.length) return;
    TABS.choose(9);
    TABS.choose(subIdx, true);
    updateGuideHTML(true);
}

function setGuideSearch(val) {
    GUIDE_STATE.query = val || "";
    updateGuideHTML(true);
}

function clearGuideSearch() {
    GUIDE_STATE.query = "";
    const inp = document.getElementById("guide_search_in");
    if (inp) inp.value = "";
    updateGuideHTML(true);
}

function toggleGuideSearchAll() {
    GUIDE_STATE.searchAll = !GUIDE_STATE.searchAll;
    const btn = document.getElementById("guide_search_all_btn");
    if (btn) {
        btn.textContent = "Search All Parts: " + (GUIDE_STATE.searchAll ? "ON" : "OFF");
        btn.className = "btn stats_btn_sm " + (GUIDE_STATE.searchAll ? "guide_btn_on" : "");
    }
    updateGuideHTML(true);
}

function toggleGuideStatusBadges() {
    GUIDE_STATE.showStatus = !GUIDE_STATE.showStatus;
    const btn = document.getElementById("guide_status_btn");
    if (btn) {
        btn.textContent = "Live Milestone Status: " + (GUIDE_STATE.showStatus ? "ON" : "OFF");
        btn.className = "btn stats_btn_sm " + (GUIDE_STATE.showStatus ? "guide_btn_on" : "");
    }
    updateGuideHTML(true);
}

function getGuideCurrentRecommendation() {
    if (!player.rp.unl) {
        return {
            phase: "Phase 1: Ranks & Mass",
            next: "Buy Mass Upgrades 1–3, push Rank/Tier, and reach 1e15 g mass to unlock Rage Power.",
            guideSub: 1,
            gameTab: 0,
            gameStab: 0,
        };
    }
    if (!player.bh.unl) {
        return {
            phase: "Phase 2: Rage Power & Black Hole",
            next: "Buy Rage Upgrades 1–6 (especially rp3/rp4/rp5/rp6), reach 1e20 RP, and reset for Dark Matter to unlock Black Hole.",
            guideSub: 2,
            gameTab: 0,
            gameStab: 1,
        };
    }
    if (!player.atom.unl) {
        return {
            phase: "Phase 2: Black Hole & Early Challenges",
            next: "Grow Black Hole Mass, clear Challenges C1–C4, buy BH Upgrades 1–6, and hit 1.5e156 g (1 uni) BH mass for Atom!",
            guideSub: 2,
            gameTab: 0,
            gameStab: 1,
        };
    }
    if (!(player.chal.comps[7].gte(16) || player.supernova.times.gte(1) || quUnl())) {
        return {
            phase: "Phase 3: Atom & Challenge 7",
            next: "Distribute Quarks (1:1:1), push Challenges C5–C7, and reach 16 completions in Challenge 7 to unlock Elements!",
            guideSub: 3,
            gameTab: 3,
            gameStab: 0,
        };
    }
    if (!MASS_DILATION.unlocked()) {
        return {
            phase: "Phase 3: Elements → Mass Dilation",
            next: "Buy Elements 1–20 (especially e14 & e18), complete C8 once, and purchase Element 21 (Scandium) for Mass Dilation!",
            guideSub: 4,
            gameTab: 4,
            gameStab: 1,
        };
    }
    if (!STARS.unlocked()) {
        return {
            phase: "Phase 4: Mass Dilation → Stars",
            next: "Run short Mass Dilations, buy MD Upgrades & Elements 22–35, and purchase Element 36 (Krypton) to unlock Collapsed Stars!",
            guideSub: 4,
            gameTab: 4,
            gameStab: 2,
        };
    }
    if (player.supernova.times.lt(1) && !quUnl() && player.superGal.lt(1)) {
        return {
            phase: "Phase 4: Collapsed Stars → Supernova",
            next: "Unlock Star Generators 1–5 with Quarks and push Collapsed Stars to 1e90 to reach your first Supernova!",
            guideSub: 5,
            gameTab: 0,
            gameStab: 3,
        };
    }
    if (!quUnl() && player.superGal.lt(1)) {
        if (!player.supernova.post_10) {
            return {
                phase: "Phase 5: Early Supernova (SN 1–10)",
                next: "Buy Tree [c], [qol1–qol6], Star/Mass upgrades, and climb to 10 Supernovas to unlock Bosons!",
                guideSub: 5,
                gameTab: 5,
                gameStab: 0,
            };
        }
        if (!player.supernova.fermions.unl) {
            return {
                phase: "Phase 5: Bosons → Fermions",
                next: "Level Photon & Gluon upgrades, push Tree [chal*] nodes, and beat Challenge 10 once to unlock Fermions!",
                guideSub: 5,
                gameTab: 3,
                gameStab: 0,
            };
        }
        return {
            phase: "Phase 5: Fermions & Radiation → Quantum",
            next: "Buy Tree [unl1] for Radiation, alternate U-Fermions, beat Challenge 12, and reach mlt(1e4) mass to Go Quantum!",
            guideSub: 5,
            gameTab: 5,
            gameStab: 2,
        };
    }
    if (!hasUpgrade("br", 9) && player.inf.times.lt(1) && player.exotic.times.lt(1)) {
        if (!hasTree("unl3")) {
            return {
                phase: "Phase 6: Early Quantum & Primordium",
                next: "Reach 10 Quantizes for Auto-Quantum, activate Green Chroma, buy Tree [unl2] (Primordium) and [unl3] (Quantum Challenges).",
                guideSub: 7,
                gameTab: 6,
                gameStab: 0,
            };
        }
        return {
            phase: "Phase 7: Quantum Challenges, Entropy & Big Rip",
            next: "Push QC Shards, unlock Entropy at mlt(7.5e6) mass, buy Tree [unl4], Big Rip for Death Shards, and buy Big Rip Upgrade 9 (Break Dilation)!",
            guideSub: 7,
            gameTab: 3,
            gameStab: 1,
        };
    }
    if (player.inf.times.lt(1) && player.exotic.times.lt(1)) {
        return {
            phase: "Phase 7: Break Dilation → Infinity",
            next: "Push Break Dilation Upgrades (bd1–bd12), push Prestige Levels, and reach 1.79e308 Quantum Foam to Go Infinity!",
            guideSub: 8,
            gameTab: 4,
            gameStab: 3,
        };
    }
    if (player.et.times.lt(1) && player.exotic.times.lt(1)) {
        return {
            phase: "Phase 8: Infinity → Eternity",
            next: "Use Big Rip Death Shards to boost Infinity Mass, grab Inf Upgs 1–5 & 11, buy Inf Upg 14, and reach 1e2000 Pre-QU GS for Eternity!",
            guideSub: 8,
            gameTab: 0,
            gameStab: 5,
        };
    }
    if (player.superGal.lt(1) && player.exotic.times.lt(1)) {
        return {
            phase: "Phase 8: Eternity → Element 218",
            next: "Buy Shard Generators for Timeshards, push Inf Upg 15 & Challenges C13–C20, buy Element 218, and reach 1e6 Supernovas for Supernova Galaxy!",
            guideSub: 8,
            gameTab: 4,
            gameStab: 1,
        };
    }
    if (player.exotic.times.lt(1)) {
        return {
            phase: "Phase 9: Supernova Galaxies & Galactic Challenges",
            next: "Push SG milestones (SG 5 keeps Tree, SG 8 keeps Elements, SG 10 keeps Inf & unlocks Tier 3 Elements), farm GC Shards, buy Element 359, and hit ee1e12 g mass for Exotic!",
            guideSub: 6,
            gameTab: 5,
            gameStab: 4,
        };
    }
    if (player.superCluster.lt(1)) {
        return {
            phase: "Phase 10: Early Exotic & Darkness",
            next: "Buy Exotic Upgs 1–19, invest in RCB & Exotic Boosts, push Darkness (Element 414 Abyssal Blot) & Element 387, then hit 100 SG for Supernova Cluster 1!",
            guideSub: 9,
            gameTab: 7,
            gameStab: 0,
        };
    }
    if (!hasElement(486)) {
        return {
            phase: "Phase 10: Dark Run & Clusters",
            next: "Charge Tier-1 Elements (e380), push C21–C22, enter Dark Run (e450) for Glyphic Mass upgrades, climb Supernova Clusters, and unlock The Matters at Element 486!",
            guideSub: 9,
            gameTab: 7,
            gameStab: 4,
        };
    }
    if (!hasElement(556)) {
        return {
            phase: "Phase 11: The Matters, FSS & Axions",
            next: "Charge Tier 2+ Elements (e483), chain all 13 Matters, reset for Final Star Shards, climb to Cluster 21+ (Stardust & Stellar), unlock X/Y/Z Axions, and buy Element 556 (Axionic Tree)!",
            guideSub: 9,
            gameTab: 7,
            gameStab: 5,
        };
    }
    if (!hasTree("ax42")) {
        return {
            phase: "Phase 11: Axionic Tree → eee100 g",
            next: "Upgrade Axionic Tree nodes (ax1–ax41), raise Matter Exponent & Beyond Ranks (Enne 100+), and reach eee100 g mass to unlock [ax42]!",
            guideSub: 9,
            gameTab: 5,
            gameStab: 0,
        };
    }
    return {
        phase: "Phase 11: Endgame Complete / Challenge 24",
        next: "Buy final Quantum+ upgrades (qp38–qp41) and push Challenge 24, Final Star Shards, Beyond Ranks, and Axions as far as you want!",
        guideSub: 9,
        gameTab: 3,
        gameStab: 0,
    };
}

function countAllGuideMilestones() {
    let total = 0;
    let completed = 0;
    for (let i = 0; i < GUIDE_CHAPTERS.length; i++) {
        const ms = GUIDE_CHAPTERS[i].milestones || [];
        for (let j = 0; j < ms.length; j++) {
            total++;
            if (gSafe(ms[j].done, false)) completed++;
        }
    }
    return { completed, total };
}

function setupGuideHTML() {
    const root = document.getElementById("tab_frame9");
    if (!root) return;

    root.innerHTML = `<div class="guide_container">
        <div id="guide_tracker" class="guide_tracker"></div>
        <div class="guide_toolbar">
            <input id="guide_search_in" class="stats_search" type="text" placeholder="Search guide (e.g. Big Rip, Chroma, C7, Axions, Softcap)..." oninput="setGuideSearch(this.value)">
            <button class="btn stats_btn_sm" onclick="clearGuideSearch()">Clear</button>
            <button id="guide_search_all_btn" class="btn stats_btn_sm" onclick="toggleGuideSearchAll()">Search All Parts: OFF</button>
            <button id="guide_status_btn" class="btn stats_btn_sm guide_btn_on" onclick="toggleGuideStatusBadges()">Live Milestone Status: ON</button>
        </div>
        <div id="guide_content"></div>
        <div id="guide_footer" class="guide_footer"></div>
    </div>`;
}

function renderGuideCardHTML(card, chapter, fromGlobalSearch = false) {
    let bodyHTML = "";
    if (card.type === "table") {
        const thead = `<tr>${card.headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
        const tbody = card.rows.map(r => `<tr>${r.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("");
        bodyHTML = `<div class="guide_table_wrap"><table class="guide_table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>`;
    } else {
        bodyHTML = `<div class="guide_body">${card.body}</div>`;
    }

    let calloutHTML = "";
    if (card.callout) {
        const label = card.callout.kind === "warn" ? "Watch Out" : (card.callout.kind === "milestone" ? "Key Milestone" : "Pro Tip");
        calloutHTML = `<div class="guide_callout ${card.callout.kind}"><b>${label}:</b> ${card.callout.text}</div>`;
    }

    const chapterTag = fromGlobalSearch
        ? `<button class="btn stats_btn_sm" onclick="jumpToGuideSubTab(${chapter.id})">In: ${gEsc(chapter.title)}</button>`
        : "";

    return `<div class="guide_card guide_accent_${chapter.accent}">
        <div class="guide_card_head">
            <div class="guide_card_title">${card.title}</div>
            ${chapterTag}
        </div>
        ${bodyHTML}
        ${calloutHTML}
    </div>`;
}

function renderGuideMilestonesHTML(chapter) {
    if (!GUIDE_STATE.showStatus || !chapter.milestones || chapter.milestones.length === 0) return "";
    const rows = chapter.milestones.map((m, idx) => {
        const bid = `guide_ms_${chapter.id}_${idx}`;
        const jid = `guide_ms_jump_${chapter.id}_${idx}`;
        const canJump = m.tab !== undefined;
        return `<div class="guide_ms_row">
            <span id="${bid}" class="stats_badge">...</span>
            <span class="guide_ms_label">${m.label}</span>
            ${canJump ? `<button id="${jid}" class="btn stats_btn_sm" onclick="jumpToGuideGameTab(${m.tab}, ${m.stab || 0})">Go</button>` : ""}
        </div>`;
    }).join("");

    return `<div class="guide_card guide_accent_${chapter.accent}">
        <div class="guide_card_head">
            <div class="guide_card_title">Progression Checkpoints — ${gEsc(chapter.title)}</div>
        </div>
        <div class="guide_ms_grid">${rows}</div>
    </div>`;
}

function cardMatchesQuery(card, chapter, q) {
    if (!q) return true;
    const raw = [
        chapter.title,
        chapter.subtitle,
        card.title,
        card.tags || "",
        card.body || "",
        card.headers ? card.headers.join(" ") : "",
        card.rows ? card.rows.flat().join(" ") : "",
        card.callout ? card.callout.text : "",
    ].join(" ").replace(/<[^>]*>/g, " ").toLowerCase();
    return raw.includes(q);
}

function updateGuideLiveBadges(sub, q, searchAll) {
    const rec = getGuideCurrentRecommendation();
    const counts = countAllGuideMilestones();
    const trackerKey = `${rec.phase}|${rec.next}|${counts.completed}/${counts.total}|${isGuideGameTabUnlocked(rec.gameTab)}`;
    const trackerEl = document.getElementById("guide_tracker");
    if (trackerEl && GUIDE_STATE.lastTrackerKey !== trackerKey) {
        GUIDE_STATE.lastTrackerKey = trackerKey;
        const canOpenGame = isGuideGameTabUnlocked(rec.gameTab);
        trackerEl.innerHTML = `
            <div class="guide_tracker_main">
                <div class="guide_tracker_phase">${gEsc(rec.phase)} <span class="stats_badge info">Checkpoints: ${counts.completed} / ${counts.total}</span></div>
                <div class="guide_tracker_next"><b>Recommended Next Step:</b> ${gEsc(rec.next)}</div>
            </div>
            <div class="guide_tracker_actions">
                <button class="btn stats_btn_sm" onclick="jumpToGuideSubTab(${rec.guideSub})">Open Guide Part</button>
                ${canOpenGame ? `<button class="btn stats_btn_sm" onclick="jumpToGuideGameTab(${rec.gameTab}, ${rec.gameStab || 0})">Open Game Tab</button>` : ""}
            </div>
        `;
    }

    if (!GUIDE_STATE.showStatus) return;
    const chaptersToCheck = (q && searchAll) ? GUIDE_CHAPTERS : [GUIDE_CHAPTERS[sub]].filter(Boolean);
    let checkKey = "";
    const results = [];
    let foundFirstNext = false;

    for (let c = 0; c < chaptersToCheck.length; c++) {
        const ch = chaptersToCheck[c];
        const ms = ch.milestones || [];
        for (let i = 0; i < ms.length; i++) {
            const isDone = !!gSafe(ms[i].done, false);
            let state = "UPCOMING";
            if (isDone) state = "DONE";
            else if (!foundFirstNext) {
                state = "NEXT";
                foundFirstNext = true;
            }
            const canGo = isGuideGameTabUnlocked(ms[i].tab);
            checkKey += `${ch.id}:${i}=${state}:${canGo ? 1 : 0};`;
            results.push({ chId: ch.id, idx: i, state, canGo });
        }
    }

    if (GUIDE_STATE.lastCheckKey !== checkKey) {
        GUIDE_STATE.lastCheckKey = checkKey;
        for (let k = 0; k < results.length; k++) {
            const r = results[k];
            const el = document.getElementById(`guide_ms_${r.chId}_${r.idx}`);
            if (el) {
                if (r.state === "DONE") {
                    el.textContent = "DONE";
                    el.className = "stats_badge unlocked";
                } else if (r.state === "NEXT") {
                    el.textContent = "NEXT";
                    el.className = "stats_badge active";
                } else {
                    el.textContent = "UPCOMING";
                    el.className = "stats_badge locked";
                }
            }
            const btn = document.getElementById(`guide_ms_jump_${r.chId}_${r.idx}`);
            if (btn) btn.style.display = r.canGo ? "" : "none";
        }
    }
}

function updateGuideHTML(force = false) {
    const sub = Math.min(Math.max(tmp.stab[9] || 0, 0), GUIDE_CHAPTERS.length - 1);
    const q = GUIDE_STATE.query.trim().toLowerCase();
    const searchAll = GUIDE_STATE.searchAll;
    const showStatus = GUIDE_STATE.showStatus ? 1 : 0;
    const renderKey = `${sub}|${q}|${searchAll ? 1 : 0}|${showStatus}`;

    const contentEl = document.getElementById("guide_content");
    const footerEl = document.getElementById("guide_footer");

    if (contentEl && (force || GUIDE_STATE.lastRenderKey !== renderKey)) {
        GUIDE_STATE.lastRenderKey = renderKey;
        GUIDE_STATE.lastCheckKey = "";

        if (q && searchAll) {
            let cardsHTML = "";
            let matchCount = 0;
            for (let i = 0; i < GUIDE_CHAPTERS.length; i++) {
                const ch = GUIDE_CHAPTERS[i];
                for (let j = 0; j < ch.cards.length; j++) {
                    if (cardMatchesQuery(ch.cards[j], ch, q)) {
                        matchCount++;
                        cardsHTML += renderGuideCardHTML(ch.cards[j], ch, true);
                    }
                }
            }
            contentEl.innerHTML = `
                <div class="guide_header guide_accent_guide">
                    <div class="guide_header_title">Search Results Across All Guide Parts (${matchCount} matching section${matchCount === 1 ? "" : "s"})</div>
                    <div class="guide_header_sub">Showing all cards matching "<b>${gEsc(GUIDE_STATE.query.trim())}</b>". Click any "In: ..." button to jump straight to that sub-tab.</div>
                </div>
                ${cardsHTML || `<div class="stats_empty">No guide entries matched "${gEsc(GUIDE_STATE.query.trim())}".</div>`}
            `;
        } else {
            const ch = GUIDE_CHAPTERS[sub];
            const matchedCards = ch.cards.filter(c => cardMatchesQuery(c, ch, q));
            const openTargetBtn = isGuideGameTabUnlocked(ch.targetTab)
                ? `<button class="btn stats_btn_sm" onclick="jumpToGuideGameTab(${ch.targetTab}, ${ch.targetStab || 0})">Open Related Game Tab</button>`
                : "";
            contentEl.innerHTML = `
                <div class="guide_header guide_accent_${ch.accent}">
                    <div class="guide_header_row">
                        <div>
                            <div class="guide_header_title">Part ${sub + 1} / ${GUIDE_CHAPTERS.length}: ${gEsc(ch.title)}</div>
                            <div class="guide_header_sub">${gEsc(ch.subtitle)}</div>
                        </div>
                        <div>${openTargetBtn}</div>
                    </div>
                </div>
                ${!q ? renderGuideMilestonesHTML(ch) : ""}
                ${matchedCards.map(c => renderGuideCardHTML(c, ch, false)).join("") || `<div class="stats_empty">No entries in "${gEsc(ch.title)}" matched "${gEsc(GUIDE_STATE.query.trim())}". Try enabling "Search All Parts".</div>`}
            `;
        }

        if (footerEl) {
            const prevBtn = sub > 0
                ? `<button class="btn stats_btn_sm" onclick="jumpToGuideSubTab(${sub - 1})">&larr; Part ${sub}: ${gEsc(GUIDE_CHAPTERS[sub - 1].title)}</button>`
                : `<span></span>`;
            const nextBtn = sub < GUIDE_CHAPTERS.length - 1
                ? `<button class="btn stats_btn_sm" onclick="jumpToGuideSubTab(${sub + 1})">Part ${sub + 2}: ${gEsc(GUIDE_CHAPTERS[sub + 1].title)} &rarr;</button>`
                : `<span></span>`;
            footerEl.innerHTML = `${prevBtn}<span class="guide_footer_pos">Sub-Tab ${sub + 1} of ${GUIDE_CHAPTERS.length}</span>${nextBtn}`;
        }
    }

    updateGuideLiveBadges(sub, q, searchAll);
}
