let
   pkgs = import <nixpkgs> {overlays = [(self: super: {
     jdk = pkgs.jdk12;
     jre = pkgs.jdk12;
   }) ]; };
   unstable = import <nixos-unstable> { config = { allowUnfree = true; }; };
in 
with pkgs;
stdenv.mkDerivation {
  name = "medics";
  nativeBuildInputs = [
    python37Full
    nodejs-12_x
  ];
  buildInputs = [
  ];  
}
