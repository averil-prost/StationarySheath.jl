var documenterSearchIndex = {"docs":
[{"location":"Example/#Example","page":"Example","title":"Example","text":"","category":"section"},{"location":"Example/","page":"Example","title":"Example","text":"Setting the simulation parameters. ","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"params contains the physical constants, the meshes parameters and the number of iterations.\nphi is the electrostatic potential. Current implementation covers \ngrid representation, by storing the value on a regular 1d mesh\npoly representation, by decomposition in a polynomial basis.\nf_eb is the boundary condition at (x=0vleqslant 0).","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"    using StationarySheath\n\n    params = Params(Nx=100,Nve=100,Nvi=100) # only keywords arguments for this one\n    # phi = Phidata_grid(params.meshx)\n    phi = Phidata_poly(5, \"pair\", params.meshx)\n    f_eb = Feb(phi,params)","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"Allocation of program variables. ","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"    # physical quantities\n    ni = zeros(params.meshx.NN+1)\n    ne = zeros(params.meshx.NN+1)\n    phix  = eval_phi(phi, params, params.meshx.mesh) # eval of phi on meshx\n    phidx = eval_phi_dx(phi, params, params.meshx.mesh) # eval of phi' on meshx\n\n    # allocations of temporary variables\n    vi     = zeros(params.meshx.NN+1) # temp velocities along ion char\n    vip    = zeros(params.meshx.NN+1) # temp velocities along ion char (previous)\n    chari  = zeros(params.Nvi+1) # temp velocities at x=0 for ions\n    chare  = zeros(params.Nve+1) # temp velocities at x=z for electrons\n    tointe = zeros(params.Nve+1) # electron velocities to integrate\n    toint  = zeros(params.meshx.NN+1) # to integrate on space\n    phixp  = copy(phix) # previous phix, for stopping criterion","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"Main loop. ","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"\n    goOn = true; n=0\n    while (goOn && n<params.Nit_max)\n\n        compute_ni!(ni, chari, vi, vip, toint, params, f_eb, phix, phidx)\n        compute_ne!(ne, chare, tointe, params, f_eb, phix)\n        solve_Poisson!(phi, params, ni, ne)\n        \n        phix  .=    eval_phi(phi, params, params.meshx.mesh)\n        phidx .= eval_phi_dx(phi, params, params.meshx.mesh)\n\n        goOn = diags_loop(params, phi, ni, ne, phix, phixp, n, eps)\n        phixp .= phix\n        f_eb.Le_threshold = 𝓛ₑ(params, phix[end], 0.0)\n\n        n += 1\n\n    end # main loop","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"The evaluation of phi is always available in phix, regardless of the representation choice.","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"    plot(params.meshx.mesh, phix, legend=false, title=\"Electrostatic potential\", xlabel=\"x\")","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"Spatial densities may be plotted directly.","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"    p = plot(layout=(1,2), size=(800,300))\n    plot!(p[1], params.meshx.mesh, ni, legend=false, title=\"Ion density\")\n    plot!(p[2], params.meshx.mesh, ne, legend=false, title=\"Electron density\")","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"The kinetic densities f_i and f_e may be reconstructed for plotting.","category":"page"},{"location":"Example/","page":"Example","title":"Example","text":"\n    fe = zeros(params.Nve+1, params.meshx.NN+1) # regular grid evaluation\n    fi = zeros(params.Nvi+1, params.meshx.NN+1) # regular grid approximation\n\n    build_fe!(fe, params, f_eb, phix)\n    build_fi!(fi, params, f_eb, phix, phidx)\n\n    p = plot(layout=(1,2), size=(800,300))\n    heatmap!(p[1], fi, title=\"f_i\")\n    heatmap!(p[2], fe, title=\"f_e\")","category":"page"},{"location":"Types/#Types","page":"Types","title":"Types","text":"","category":"section"},{"location":"Types/","page":"Types","title":"Types","text":"Modules = [StationarySheath]\nPages = [\"Types.jl\"]","category":"page"},{"location":"Types/#StationarySheath.Feb","page":"Types","title":"StationarySheath.Feb","text":"mutable struct Feb\n\nBoundary condition f_eb for the electron density at (x=0v0).\n\nLe_threshold::Float64\nMaximal electric energy mathcalL_e(xv) s.t. (xv)insupp(f_eb)\nvalue::Function\nPrescribed value at (x=0vleqslant 0)\n\n\n\n\n\n","category":"type"},{"location":"Types/#StationarySheath.Mesh","page":"Types","title":"StationarySheath.Mesh","text":"struct Mesh\n\nmin::Float64\nMinimal value\nmax::Float64\nMaximal value\nstep::Float64\nStep\nNN::Int64\nNumber of intervals\nmesh::Vector{Float64}\nMesh itself\n\n\n\n\n\n","category":"type"},{"location":"Types/#StationarySheath.Params","page":"Types","title":"StationarySheath.Params","text":"struct Params\n\nλ::Float64\nDebye length\nμ::Float64\nMass ratio\nν::Float64\nIonization factor\nmeshx::Mesh\nSpace mesh\nNvi::Int64\nNumber of points in ion speed mesh\nNve::Int64\nNumber of points in electron speed mesh\nNit_max::Int64\nMaximal number of fixed-point iterations\n\n\n\n\n\n","category":"type"},{"location":"Types/#StationarySheath.Phidata_grid","page":"Types","title":"StationarySheath.Phidata_grid","text":"struct Phidata_grid <: Phidata\n\nRepresentation of \\phi on a 1D regular mesh. \n\nvalues::Vector{Float64}\nPointwise values on the space mesh\n\n\n\n\n\n","category":"type"},{"location":"Types/#StationarySheath.Phidata_poly","page":"Types","title":"StationarySheath.Phidata_poly","text":"struct Phidata_poly <: Phidata\n\nPolynomial representation of \\phi. Basis are:\n\ncanonical: starting from degree 2.\npair: only pair expononents of the canonical basis.\n\ncardinal::Int64\nCardinal of the basis\nbasis::String\nBasis choice\nhorner::Vector{Vector{Float64}}\nArray of Horner coefficients for x to p(x)\nhorner_dx::Vector{Vector{Float64}}\nArray of Horner coefficients for x to p(x)\nVandermonde::Matrix{Float64}\nMatrix of the linear system for the Poisson solver\ncoeffs::Vector{Float64}\nCoefficients in the basis\n\n\n\n\n\n","category":"type"},{"location":"Eval/#Evaluations","page":"Evaluations","title":"Evaluations","text":"","category":"section"},{"location":"Eval/","page":"Evaluations","title":"Evaluations","text":"Modules = [StationarySheath]\nPages = [\"Eval.jl\"]","category":"page"},{"location":"Eval/#StationarySheath.eval_fe!-Tuple{Any, Feb, Params, Any, Any}","page":"Evaluations","title":"StationarySheath.eval_fe!","text":"eval_fe!(res, f_eb, params, phix, v)\n\n\nReturn the value f_e(xv). \n\nNote that the non-emitting boundary condition has precedence over the prescribed value f_eb, and the result will be 0 whenever 𝓛ₑ(x,v) ⩾ 𝓛ₑ(1,0).\n\n\n\n\n\n","category":"method"},{"location":"Eval/#StationarySheath.eval_phi-Tuple{Phidata_grid, Params, Any}","page":"Evaluations","title":"StationarySheath.eval_phi","text":"eval_phi(phi, params, x)\n\n\nValue of ϕ at x.\n\n\n\n\n\n","category":"method"},{"location":"Eval/#StationarySheath.eval_phi-Tuple{Phidata_poly, Params, Any}","page":"Evaluations","title":"StationarySheath.eval_phi","text":"eval_phi(phi, params, x)\n\n\nValue of ϕ at x.\n\n\n\n\n\n","category":"method"},{"location":"Eval/#StationarySheath.eval_phi_dx-Tuple{Phidata_grid, Params, Any}","page":"Evaluations","title":"StationarySheath.eval_phi_dx","text":"eval_phi_dx(phi, params, x)\n\n\nValue of ϕ' at x.\n\n\n\n\n\n","category":"method"},{"location":"Eval/#StationarySheath.eval_phi_dx-Tuple{Phidata_poly, Params, Any}","page":"Evaluations","title":"StationarySheath.eval_phi_dx","text":"eval_phi_dx(phi, params, x)\n\n\nValue of ϕ' at x.\n\n\n\n\n\n","category":"method"},{"location":"Eval/#StationarySheath.evaluate_poly-Tuple{Any, Any}","page":"Evaluations","title":"StationarySheath.evaluate_poly","text":"evaluate_poly(eval, x)\n\n\nReturn the polynomial \n\n    a_1 + x (a_2 + x dots (a_n-1 + x a_n))\n\nwith eval=a_1dotsa_n.\n\n\n\n\n\n","category":"method"},{"location":"Eval/#StationarySheath.get_v_char_e-Tuple{Params, Any, Any, Any}","page":"Evaluations","title":"StationarySheath.get_v_char_e","text":"get_v_char_e(params, v0, phix0, phix)\n\n\nReturn the negative v such that\n\n    fracv^22 - frac1mu phi(x) = fracv_0^22 - frac1mu phi(x_0)\n\n\n\n\n\n","category":"method"},{"location":"Eval/#StationarySheath.get_v_char_i-Tuple{Any, Any, Any}","page":"Evaluations","title":"StationarySheath.get_v_char_i","text":"get_v_char_i(v0, phix0, phix)\n\n\nReturn the negative v such that\n\n    fracv^22 + phi(x) = fracv_0^22 + phi(x_0)\n\n\n\n\n\n","category":"method"},{"location":"Eval/#StationarySheath.𝓛ᵢ-Tuple{Any, Any}","page":"Evaluations","title":"StationarySheath.𝓛ᵢ","text":"𝓛ᵢ(phix, v)\n\n\nIon infinitesimal energy.\n\n\n\n\n\n","category":"method"},{"location":"Eval/#StationarySheath.𝓛ₑ-Tuple{Params, Any, Any}","page":"Evaluations","title":"StationarySheath.𝓛ₑ","text":"𝓛ₑ(params, phix, v)\n\n\nElectric infinitesimal energy.\n\n\n\n\n\n","category":"method"},{"location":"Algo/#Algorithm","page":"Algorithm","title":"Algorithm","text":"","category":"section"},{"location":"Algo/","page":"Algorithm","title":"Algorithm","text":"Modules = [StationarySheath]\nPages = [\"Algo.jl\"]","category":"page"},{"location":"Algo/#StationarySheath.compute_ne!-Tuple{Vector, Vector{Float64}, Vector{Float64}, Params, Feb, Vector{Float64}}","page":"Algorithm","title":"StationarySheath.compute_ne!","text":"compute_ne!(ne, chare, tointe, params, f_eb, phix)\n\n\nComputation of \n\n    n_e(x) = int_vinmathbbR f_e(xv) dv = 2 int_v leqslant 0 f_e(xv) dv\n\n\n\n\n\n","category":"method"},{"location":"Algo/#StationarySheath.compute_ni!-Tuple{Vector, Vector{Float64}, Vector{Float64}, Vector{Float64}, Vector{Float64}, Params, Feb, Vector{Float64}, Vector{Float64}}","page":"Algorithm","title":"StationarySheath.compute_ni!","text":"compute_ni!(\n    ni,\n    chari,\n    vi,\n    vip,\n    toint,\n    params,\n    f_eb,\n    phix,\n    phidx\n)\n\n\nComputation of \n\n    n_i(x) = int_vinmathbbR f_i(xv) dv = 2 int_v leqslant 0 f_i(x_b(xv)v_b(xv)) dv\n\n\n\n\n\n","category":"method"},{"location":"Algo/#StationarySheath.integral_char_00!-Tuple{Vector{Float64}, Vector{Float64}, Params, Vector{Float64}, Feb}","page":"Algorithm","title":"StationarySheath.integral_char_00!","text":"integral_char_00!(vi, toint, params, phix, f_eb)\n\n\nSpecial case of the critical characteristic: use of a rectangle integration scheme to avoid the equilibrium point (x=0v=0).\n\n\n\n\n\n","category":"method"},{"location":"Algo/#StationarySheath.integral_char_vb0!-Tuple{Vector{Float64}, Vector{Float64}, Params, Int64, Vector{Float64}, Vector{Float64}, Feb}","page":"Algorithm","title":"StationarySheath.integral_char_vb0!","text":"integral_char_vb0!(\n    vi,\n    toint,\n    params,\n    ixb,\n    phix,\n    phidx,\n    f_eb\n)\n\n\nCompute the integral of f_e along the ion characteristic reaching (x_b0v_b=0) at tau=0. Here x_b is known through phi(x_b) only. Use\n\n    int_tau=-infty^0 f_e(x(tau)v(tau))\n    = int_v=vmin^0 fracf_e(x(v)v)-phi(x(v)) dv\n\nand a trapeze integral on the points (x(v)v) s.t. x(v)inmeshx. Preallocated vectors vi and toint will be modified by the function.\n\n\n\n\n\n","category":"method"},{"location":"Algo/#StationarySheath.integral_char_xb0!-Tuple{Vector{Float64}, Vector{Float64}, Params, Float64, Vector{Float64}, Feb}","page":"Algorithm","title":"StationarySheath.integral_char_xb0!","text":"integral_char_xb0!(vi, toint, params, vb, phix, f_eb)\n\n\nCompute the integral of f_e along the ion characteristic reaching (x_b=0v_b0) at tau=0. Use\n\n    int_tau=-infty^0 f_e(x(tau)v(tau))\n    = int_z=0^1 fracf_e(z-sqrtv_b^2 - 2*phi(z))-sqrtv_b^2 - 2*phi(z) dz\n\nand a trapeze integral on the points (z-g_z(v_b)) s.t. zinmeshx. Preallocated vectors vi and toint will be modified by the function.\n\n\n\n\n\n","category":"method"},{"location":"Algo/#StationarySheath.solve_Poisson!-Tuple{Phidata_grid, Params, Vector{Float64}, Vector{Float64}}","page":"Algorithm","title":"StationarySheath.solve_Poisson!","text":"solve_Poisson!(phi, params, ni, ne)\n\n\nResolution by quadrature when phi is approximated pointwise.\n\n\n\n\n\n","category":"method"},{"location":"Algo/#StationarySheath.solve_Poisson!-Tuple{Phidata_poly, Params, Vector{Float64}, Vector{Float64}}","page":"Algorithm","title":"StationarySheath.solve_Poisson!","text":"solve_Poisson!(phi, params, ni, ne)\n\n\nResolution by least squares when phi is decomposed in a polynomial basis.\n\n\n\n\n\n","category":"method"},{"location":"Diags/#Diagnostics","page":"Diagnostics","title":"Diagnostics","text":"","category":"section"},{"location":"Diags/","page":"Diagnostics","title":"Diagnostics","text":"Modules = [StationarySheath]\nPages = [\"Diags.jl\"]","category":"page"},{"location":"Diags/#StationarySheath.build_fe!-Tuple{Matrix, Params, Feb, Vector{Float64}}","page":"Diagnostics","title":"StationarySheath.build_fe!","text":"build_fe!(fe, params, f_eb, phix)\n\n\nEvaluation of f_e on the regular grid meshx × meshve. \n\nThe speed mesh is computed to fit 0 ⩽ 𝓛ₑ ⩽ 𝓛ₑ(1,0).\n\n\n\n\n\n","category":"method"},{"location":"Diags/#StationarySheath.build_fi!-Tuple{Matrix, Params, Feb, Vector{Float64}, Vector{Float64}}","page":"Diagnostics","title":"StationarySheath.build_fi!","text":"build_fi!(fi, params, f_eb, phix, phidx)\n\n\nApproximation of f_i on a regular grid meshx × meshvi.\n\n\n\n\n\n","category":"method"},{"location":"Diags/#StationarySheath.diags_end-Tuple{Params, Phidata, Feb, Vector{Float64}, Vector{Float64}, Vector{Float64}, Vector{Float64}, Int64}","page":"Diagnostics","title":"StationarySheath.diags_end","text":"diags_end(params, phi, f_eb, ni, ne, phix, phidx, n)\n\n\nAggregation of diagnostics performed at the end of the program.\n\n\n\n\n\n","category":"method"},{"location":"Diags/#StationarySheath.diags_loop-Tuple{Params, Phidata, Vector{Float64}, Vector{Float64}, Vector{Float64}, Vector{Float64}, Int64, Float64}","page":"Diagnostics","title":"StationarySheath.diags_loop","text":"diags_loop(params, phi, ni, ne, phix, phixp, n, eps)\n\n\nAggregation of diagnostics performed during the fixed-point loop.\n\n\n\n\n\n","category":"method"},{"location":"Diags/#StationarySheath.ploot-Tuple{Mesh, Vector{Float64}, String}","page":"Diagnostics","title":"StationarySheath.ploot","text":"ploot(mesh, value, tag; erase)\n\n\nPlot and wait for user input.\n\n\n\n\n\n","category":"method"},{"location":"#Stationary-Sheath","page":"Home","title":"Stationary Sheath","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Implementation of a fixed-point algorithm for  the stationary Vlasov-Poisson system.","category":"page"},{"location":"","page":"Home","title":"Home","text":"    begincases\n        v partial_x f_e(xv) + frac1mu phi(x) partial_v f_e(xv) = 0 \n        v partial_x f_i(xv) - phi(x) partial_v f_i(xv) = nu f_e(xv) \n        - lambda^2 phi(x) = n_i(x) - n_e(x)\n    endcases","category":"page"},{"location":"","page":"Home","title":"Home","text":"with the densities n_s, sinie defined as","category":"page"},{"location":"","page":"Home","title":"Home","text":"    n_s(x) = int_vinmathbbR f_s(xv) dv","category":"page"},{"location":"","page":"Home","title":"Home","text":"Code initiated during CEMRACS 2022 by Michel Mehrenberger, Anaïs Crestetto, Mehdi Badsi and Averil Prost. Valuable Julia support by Pierre Navaro.","category":"page"},{"location":"#Contents","page":"Home","title":"Contents","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Modules = [StationarySheath]\nPages = [\"Types.md\", \"Eval.md\", \"Algo.md\", \"Diags.md\"]","category":"page"},{"location":"#Index","page":"Home","title":"Index","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"Modules = [StationarySheath]","category":"page"}]
}
