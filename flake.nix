{
  description = "Personal Website with Windows 98 Theme";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages.default = pkgs.stdenv.mkDerivation {
          name = "win98-personal-website";
          src = ./.;
          
          buildInputs = with pkgs; [
            nodejs
            nodePackages.npm
          ];
          
          buildPhase = ''
            export HOME=$(mktemp -d)
            npm ci
            npm run build
          '';
          
          installPhase = ''
            mkdir -p $out
            cp -r .next $out/
            cp -r public $out/
            cp -r node_modules $out/
            cp next.config.mjs $out/
            cp package.json $out/
          '';
        };
        
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs
            nodePackages.npm
            nodePackages.next
          ];
        };
        
        apps.default = flake-utils.lib.mkApp {
          drv = self.packages.${system}.default;
          exePath = "/bin/next";
        };
      }
    );
}
