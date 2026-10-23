// BUILT-IN FORMULA CATALOG — EDIT THIS FILE TO ADD OR UPDATE REFERENCE FORMULAS.
// Keep all built-in formulas here, grouped by category: MSTC, HPGE, or PSAD.
// Each entry uses named fields so you can safely edit or copy a formula: 
//   name: the formula's display name
//   formula: the formula text shown in the app
//   where: an array of explanation lines for the “Where” section
//   mnemonics: a memory aid (use an empty string when not needed)
//   acceptedAnswers: optional alternate formula spellings for memorization
// Add each new entry inside the correct category's array and separate entries with commas.
// Important: quote all text values and keep the commas/brackets valid. The app reads this catalog at startup.
const RAW = {
  "MSTC": [
    {
      "name": "Area of a Circle",
      "formula": "A = πr²",
      "where": [
        "A = area",
        "r = radius",
        "also A = (π/4)d², d = diameter"
      ],
      "mnemonics": "",
      "acceptedAnswers": [
        "A=πr²",
        "A=π/4d²",
        "A=(π/4)d²"
      ]
    },
    {
      "name": "Circumference of a Circle",
      "formula": "C = 2πr",
      "where": [
        "C = circumference",
        "r = radius"
      ],
      "mnemonics": ""
    },
    {
      "name": "Area of Triangle (Heron)",
      "formula": "A = √(s(s−a)(s−b)(s−c))",
      "where": [
        "s = (a+b+c)/2",
        "a, b, c = sides"
      ],
      "mnemonics": ""
    },
    {
      "name": "Area of Triangle (SAS)",
      "formula": "A = (1/2)absinC",
      "where": [
        "a, b = two sides",
        "C = included angle"
      ],
      "mnemonics": ""
    },
    {
      "name": "Law of Sines",
      "formula": "a/sinA = b/sinB = c/sinC",
      "where": [
        "a, b, c = sides",
        "A, B, C = opposite angles"
      ],
      "mnemonics": ""
    },
    {
      "name": "Law of Cosines",
      "formula": "c² = a² + b² − 2abcosC",
      "where": [
        "a, b, c = sides",
        "C = angle opposite c"
      ],
      "mnemonics": ""
    },
    {
      "name": "Pythagorean Identity",
      "formula": "sin²θ + cos²θ = 1",
      "where": [
        "θ = any angle"
      ],
      "mnemonics": ""
    },
    {
      "name": "Tangent Identity",
      "formula": "tanθ = sinθ/cosθ",
      "where": [
        "θ = any angle"
      ],
      "mnemonics": "SOH-CAH-TOA: Sin = Opp/Hyp, Cos = Adj/Hyp, Tan = Opp/Adj"
    },
    {
      "name": "Quadratic Formula",
      "formula": "x = (−b±√(b²−4ac))/2a",
      "where": [
        "ax² + bx + c = 0",
        "a, b, c = coefficients"
      ],
      "mnemonics": "Negative b, plus or minus the root of b squared minus 4ac, over 2a"
    },
    {
      "name": "Distance Formula",
      "formula": "d = √((x₂−x₁)²+(y₂−y₁)²)",
      "where": [
        "d = distance between two points",
        "(x₁, y₁), (x₂, y₂) = the points"
      ],
      "mnemonics": ""
    },
    {
      "name": "Slope of a Line",
      "formula": "m = (y₂−y₁)/(x₂−x₁)",
      "where": [
        "m = slope",
        "(x₁, y₁), (x₂, y₂) = two points"
      ],
      "mnemonics": ""
    },
    {
      "name": "Arithmetic Progression (nth term)",
      "formula": "aₙ = a₁ + (n−1)d",
      "where": [
        "aₙ = nth term",
        "a₁ = first term",
        "d = common difference"
      ],
      "mnemonics": ""
    },
    {
      "name": "Sum of Arithmetic Progression",
      "formula": "Sₙ = (n/2)(a₁+aₙ)",
      "where": [
        "Sₙ = sum of n terms",
        "a₁ = first term, aₙ = last term"
      ],
      "mnemonics": ""
    },
    {
      "name": "Geometric Progression (nth term)",
      "formula": "aₙ = a₁rⁿ⁻¹",
      "where": [
        "a₁ = first term",
        "r = common ratio"
      ],
      "mnemonics": ""
    },
    {
      "name": "Sum of Infinite Geometric Series",
      "formula": "S = a₁/(1−r)",
      "where": [
        "a₁ = first term",
        "r = common ratio, |r| < 1"
      ],
      "mnemonics": ""
    },
    {
      "name": "Combination",
      "formula": "C = n!/(r!(n−r)!)",
      "where": [
        "n = total items",
        "r = items chosen"
      ],
      "mnemonics": ""
    },
    {
      "name": "Compound Interest",
      "formula": "F = P(1+i)ⁿ",
      "where": [
        "F = future worth",
        "P = present worth",
        "i = interest rate per period",
        "n = number of periods"
      ],
      "mnemonics": ""
    },
    {
      "name": "Straight-Line Depreciation",
      "formula": "d = (C−S)/n",
      "where": [
        "d = annual depreciation",
        "C = first cost",
        "S = salvage value",
        "n = life in years"
      ],
      "mnemonics": ""
    },
    {
      "name": "Curvature & Refraction Correction",
      "formula": "C = 0.0675K²",
      "where": [
        "C = correction in meters",
        "K = distance in kilometers"
      ],
      "mnemonics": ""
    },
    {
      "name": "Stadia Horizontal Distance",
      "formula": "H = Kscos²θ + Ccosθ",
      "where": [
        "H = horizontal distance",
        "K, C = stadia constants",
        "s = stadia intercept",
        "θ = vertical angle"
      ],
      "mnemonics": ""
    },
    {
      "name": "Trapezoidal Rule (Area)",
      "formula": "A = (d/2)(h₁+hₙ+2Σh)",
      "where": [
        "d = equal spacing",
        "h₁, hₙ = end offsets",
        "Σh = sum of interior offsets"
      ],
      "mnemonics": ""
    },
    {
      "name": "Linear Error of Closure",
      "formula": "E = √(ΣLat²+ΣDep²)",
      "where": [
        "ΣLat = sum of latitudes",
        "ΣDep = sum of departures"
      ],
      "mnemonics": ""
    },
    {
      "name": "Simple Curve: Tangent Distance",
      "formula": "T = Rtan(I/2)",
      "where": [
        "T = tangent distance",
        "R = radius",
        "I = intersection angle"
      ],
      "mnemonics": ""
    },
    {
      "name": "Simple Curve: External Distance",
      "formula": "E = R(sec(I/2)−1)",
      "where": [
        "E = external distance",
        "R = radius",
        "I = intersection angle"
      ],
      "mnemonics": ""
    },
    {
      "name": "Simple Curve: Length of Curve",
      "formula": "Lc = πRI/180",
      "where": [
        "Lc = length of curve",
        "R = radius",
        "I = intersection angle in degrees"
      ],
      "mnemonics": ""
    },
    {
      "name": "Simple Curve: Long Chord",
      "formula": "C = 2Rsin(I/2)",
      "where": [
        "C = long chord",
        "R = radius",
        "I = intersection angle"
      ],
      "mnemonics": ""
    },
    {
      "name": "Superelevation",
      "formula": "e + f = V²/127R",
      "where": [
        "e = superelevation rate",
        "f = side friction factor",
        "V = speed in km/h",
        "R = radius in m"
      ],
      "mnemonics": ""
    },
    {
      "name": "Stopping Sight Distance",
      "formula": "SSD = 0.278Vt + V²/254f",
      "where": [
        "V = speed in km/h",
        "t = reaction time in s",
        "f = friction coefficient"
      ],
      "mnemonics": ""
    },
    {
      "name": "Traffic Flow",
      "formula": "q = kv",
      "where": [
        "q = flow",
        "k = density",
        "v = space mean speed"
      ],
      "mnemonics": ""
    }
  ],
  "HPGE": [
    {
      "name": "Continuity Equation",
      "formula": "Q = Av",
      "where": [
        "Q = discharge",
        "A = flow area",
        "v = velocity"
      ],
      "mnemonics": ""
    },
    {
      "name": "Hydrostatic Pressure",
      "formula": "P = γh",
      "where": [
        "P = pressure",
        "γ = unit weight of fluid",
        "h = depth"
      ],
      "mnemonics": ""
    },
    {
      "name": "Specific Weight",
      "formula": "γ = ρg",
      "where": [
        "γ = specific weight",
        "ρ = density",
        "g = gravity"
      ],
      "mnemonics": ""
    },
    {
      "name": "Buoyant Force",
      "formula": "B = γV",
      "where": [
        "B = buoyant force",
        "γ = unit weight of fluid",
        "V = volume displaced"
      ],
      "mnemonics": ""
    },
    {
      "name": "Hydrostatic Force on a Plane",
      "formula": "F = γhA",
      "where": [
        "F = total force",
        "h = depth of centroid",
        "A = area"
      ],
      "mnemonics": ""
    },
    {
      "name": "Bernoulli's Equation",
      "formula": "P₁/γ + v₁²/2g + z₁ = P₂/γ + v₂²/2g + z₂",
      "where": [
        "P/γ = pressure head",
        "v²/2g = velocity head",
        "z = elevation head"
      ],
      "mnemonics": ""
    },
    {
      "name": "Torricelli's Theorem",
      "formula": "v = √(2gh)",
      "where": [
        "v = jet velocity",
        "h = head above opening"
      ],
      "mnemonics": ""
    },
    {
      "name": "Reynolds Number",
      "formula": "Re = ρvD/μ",
      "where": [
        "ρ = density",
        "v = velocity",
        "D = diameter",
        "μ = dynamic viscosity"
      ],
      "mnemonics": ""
    },
    {
      "name": "Darcy-Weisbach",
      "formula": "hf = fLv²/2gD",
      "where": [
        "hf = head loss",
        "f = friction factor",
        "L = pipe length",
        "D = diameter"
      ],
      "mnemonics": ""
    },
    {
      "name": "Manning's Formula",
      "formula": "v = (1/n)R^(2/3)S^(1/2)",
      "where": [
        "n = roughness coefficient",
        "R = hydraulic radius",
        "S = slope"
      ],
      "mnemonics": ""
    },
    {
      "name": "Hazen-Williams",
      "formula": "v = 0.8492CR^0.63S^0.54",
      "where": [
        "C = roughness coefficient",
        "R = hydraulic radius",
        "S = slope"
      ],
      "mnemonics": ""
    },
    {
      "name": "Chezy Formula",
      "formula": "v = C√(RS)",
      "where": [
        "C = Chezy coefficient",
        "R = hydraulic radius",
        "S = slope"
      ],
      "mnemonics": ""
    },
    {
      "name": "Specific Energy",
      "formula": "E = y + v²/2g",
      "where": [
        "E = specific energy",
        "y = depth of flow",
        "v = velocity"
      ],
      "mnemonics": ""
    },
    {
      "name": "Froude Number",
      "formula": "Fr = v/√(gy)",
      "where": [
        "v = velocity",
        "y = depth of flow",
        "Fr = 1 is critical flow"
      ],
      "mnemonics": ""
    },
    {
      "name": "Orifice Discharge",
      "formula": "Q = Ca√(2gh)",
      "where": [
        "C = discharge coefficient",
        "a = orifice area",
        "h = head"
      ],
      "mnemonics": ""
    },
    {
      "name": "Rectangular Weir",
      "formula": "Q = (2/3)C√(2g)LH^(3/2)",
      "where": [
        "C = discharge coefficient",
        "L = crest length",
        "H = head over crest"
      ],
      "mnemonics": ""
    },
    {
      "name": "Impulse-Momentum Force",
      "formula": "F = ρQ(v₂−v₁)",
      "where": [
        "ρ = density",
        "Q = discharge",
        "v₂, v₁ = final and initial velocity"
      ],
      "mnemonics": ""
    },
    {
      "name": "Void Ratio",
      "formula": "e = Vᵥ/Vₛ",
      "where": [
        "Vᵥ = volume of voids",
        "Vₛ = volume of solids"
      ],
      "mnemonics": ""
    },
    {
      "name": "Porosity",
      "formula": "n = Vᵥ/V",
      "where": [
        "Vᵥ = volume of voids",
        "V = total volume"
      ],
      "mnemonics": ""
    },
    {
      "name": "Saturation Relation",
      "formula": "Se = wGs",
      "where": [
        "S = degree of saturation",
        "e = void ratio",
        "w = water content",
        "Gs = specific gravity of solids"
      ],
      "mnemonics": ""
    },
    {
      "name": "Dry Unit Weight",
      "formula": "γd = γ/(1+w)",
      "where": [
        "γ = moist unit weight",
        "w = water content"
      ],
      "mnemonics": ""
    },
    {
      "name": "Effective Stress",
      "formula": "σ′ = σ − u",
      "where": [
        "σ′ = effective stress",
        "σ = total stress",
        "u = pore water pressure"
      ],
      "mnemonics": ""
    },
    {
      "name": "Darcy's Law (Soil)",
      "formula": "Q = kiA",
      "where": [
        "k = permeability",
        "i = hydraulic gradient",
        "A = area"
      ],
      "mnemonics": ""
    },
    {
      "name": "Mohr-Coulomb",
      "formula": "τ = c + σtanφ",
      "where": [
        "τ = shear strength",
        "c = cohesion",
        "σ = normal stress",
        "φ = friction angle"
      ],
      "mnemonics": ""
    },
    {
      "name": "Rankine Active Coefficient",
      "formula": "Ka = (1−sinφ)/(1+sinφ)",
      "where": [
        "φ = friction angle"
      ],
      "mnemonics": ""
    },
    {
      "name": "Terzaghi Bearing Capacity (Strip)",
      "formula": "qult = cNc + qNq + 0.5γBNγ",
      "where": [
        "c = cohesion",
        "q = surcharge",
        "B = footing width",
        "Nc, Nq, Nγ = bearing factors"
      ],
      "mnemonics": ""
    },
    {
      "name": "Time Factor (Consolidation)",
      "formula": "Tᵥ = cᵥt/H²",
      "where": [
        "cᵥ = coefficient of consolidation",
        "t = time",
        "H = drainage path"
      ],
      "mnemonics": ""
    }
  ],
  "PSAD": [
    {
      "name": "Axial Stress",
      "formula": "σ = P/A",
      "where": [
        "σ = normal stress",
        "P = axial load",
        "A = area"
      ],
      "mnemonics": ""
    },
    {
      "name": "Axial Deformation",
      "formula": "δ = PL/AE",
      "where": [
        "δ = elongation",
        "P = load",
        "L = length",
        "E = modulus of elasticity"
      ],
      "mnemonics": ""
    },
    {
      "name": "Hooke's Law",
      "formula": "σ = Eε",
      "where": [
        "σ = stress",
        "E = modulus of elasticity",
        "ε = strain"
      ],
      "mnemonics": ""
    },
    {
      "name": "Poisson's Ratio",
      "formula": "ν = −εlat/εlong",
      "where": [
        "εlat = lateral strain",
        "εlong = longitudinal strain"
      ],
      "mnemonics": ""
    },
    {
      "name": "Shear Stress",
      "formula": "τ = V/A",
      "where": [
        "τ = shear stress",
        "V = shear force",
        "A = area"
      ],
      "mnemonics": ""
    },
    {
      "name": "Thermal Deformation",
      "formula": "δ = αLΔT",
      "where": [
        "α = coefficient of thermal expansion",
        "L = length",
        "ΔT = temperature change"
      ],
      "mnemonics": ""
    },
    {
      "name": "Torsion Formula",
      "formula": "τ = Tρ/J",
      "where": [
        "T = torque",
        "ρ = distance from center",
        "J = polar moment of inertia"
      ],
      "mnemonics": ""
    },
    {
      "name": "Angle of Twist",
      "formula": "θ = TL/JG",
      "where": [
        "T = torque",
        "L = length",
        "J = polar moment",
        "G = shear modulus"
      ],
      "mnemonics": ""
    },
    {
      "name": "Power Transmitted",
      "formula": "P = Tω",
      "where": [
        "P = power",
        "T = torque",
        "ω = angular speed"
      ],
      "mnemonics": ""
    },
    {
      "name": "Flexure Formula",
      "formula": "σ = My/I",
      "where": [
        "M = moment",
        "y = distance from neutral axis",
        "I = moment of inertia"
      ],
      "mnemonics": ""
    },
    {
      "name": "Horizontal Shear in Beams",
      "formula": "τ = VQ/Ib",
      "where": [
        "V = shear force",
        "Q = first moment of area",
        "I = moment of inertia",
        "b = width"
      ],
      "mnemonics": ""
    },
    {
      "name": "Moment of Inertia (Rectangle)",
      "formula": "I = bh³/12",
      "where": [
        "b = base",
        "h = height"
      ],
      "mnemonics": ""
    },
    {
      "name": "Moment of Inertia (Circle)",
      "formula": "I = πd⁴/64",
      "where": [
        "d = diameter"
      ],
      "mnemonics": ""
    },
    {
      "name": "Parallel Axis Theorem",
      "formula": "I = Ic + Ad²",
      "where": [
        "Ic = centroidal inertia",
        "A = area",
        "d = distance between axes"
      ],
      "mnemonics": ""
    },
    {
      "name": "Euler Buckling Load",
      "formula": "Pcr = π²EI/(KL)²",
      "where": [
        "E = modulus of elasticity",
        "I = moment of inertia",
        "K = effective length factor",
        "L = unbraced length"
      ],
      "mnemonics": ""
    },
    {
      "name": "Slenderness Ratio",
      "formula": "λ = KL/r",
      "where": [
        "K = effective length factor",
        "L = length",
        "r = radius of gyration"
      ],
      "mnemonics": ""
    },
    {
      "name": "SS Beam Deflection (Uniform Load)",
      "formula": "δ = 5wL⁴/384EI",
      "where": [
        "w = uniform load",
        "L = span",
        "E = modulus",
        "I = inertia"
      ],
      "mnemonics": ""
    },
    {
      "name": "SS Beam Deflection (Center Load)",
      "formula": "δ = PL³/48EI",
      "where": [
        "P = point load",
        "L = span"
      ],
      "mnemonics": ""
    },
    {
      "name": "Cantilever Deflection (End Load)",
      "formula": "δ = PL³/3EI",
      "where": [
        "P = end load",
        "L = length"
      ],
      "mnemonics": ""
    },
    {
      "name": "Max Moment: Uniform Load (SS)",
      "formula": "M = wL²/8",
      "where": [
        "w = uniform load",
        "L = span"
      ],
      "mnemonics": ""
    },
    {
      "name": "Max Moment: Center Load (SS)",
      "formula": "M = PL/4",
      "where": [
        "P = point load",
        "L = span"
      ],
      "mnemonics": ""
    },
    {
      "name": "Fixed-End Moment (Uniform Load)",
      "formula": "FEM = wL²/12",
      "where": [
        "w = uniform load",
        "L = span"
      ],
      "mnemonics": ""
    },
    {
      "name": "Modulus of Concrete",
      "formula": "Ec = 4700√(f′c)",
      "where": [
        "Ec in MPa",
        "f′c = concrete strength in MPa"
      ],
      "mnemonics": ""
    },
    {
      "name": "Stress Block Depth",
      "formula": "a = Asfy/(0.85f′cb)",
      "where": [
        "As = steel area",
        "fy = steel yield strength",
        "b = beam width"
      ],
      "mnemonics": ""
    },
    {
      "name": "Nominal Moment (Singly Reinforced)",
      "formula": "Mn = Asfy(d−a/2)",
      "where": [
        "As = steel area",
        "fy = yield strength",
        "d = effective depth",
        "a = stress block depth"
      ],
      "mnemonics": ""
    },
    {
      "name": "Concrete Shear Strength",
      "formula": "Vc = 0.17λ√(f′c)bd",
      "where": [
        "λ = concrete weight factor",
        "b = width",
        "d = effective depth"
      ],
      "mnemonics": ""
    }
  ]
};
