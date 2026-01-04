module github.com/zenith110/pokemon-engine-tools/tools-core

go 1.25

require (
	github.com/google/uuid v1.6.0
	github.com/pelletier/go-toml/v2 v2.2.3
	github.com/zenith110/pokemon-engine-tools/models v0.0.0-00010101000000-000000000000
	github.com/zenith110/pokemon-go-engine-toml-models v0.0.0-20250223140129-f44c17210e27
	gopkg.in/src-d/go-git.v4 v4.13.1
)

replace github.com/zenith110/pokemon-engine-tools/models => ../models

replace github.com/zenith110/pokemon-engine-tools/core => ../core

require (
	github.com/Microsoft/go-winio v0.6.2 // indirect
	github.com/emirpasic/gods v1.18.1 // indirect
	github.com/gliderlabs/ssh v0.3.8 // indirect
	github.com/google/go-cmp v0.7.0 // indirect
	github.com/jbenet/go-context v0.0.0-20150711004518-d14ea06fba99 // indirect
	github.com/kevinburke/ssh_config v1.2.0 // indirect
	github.com/kr/pretty v0.3.1 // indirect
	github.com/mitchellh/go-homedir v1.1.0 // indirect
	github.com/pkg/errors v0.9.1 // indirect
	github.com/rogpeppe/go-internal v1.12.0 // indirect
	github.com/sergi/go-diff v1.3.2-0.20230802210424-5b0b94c5c0d3 // indirect
	github.com/src-d/gcfg v1.4.0 // indirect
	github.com/stretchr/testify v1.10.0 // indirect
	github.com/xanzy/ssh-agent v0.3.3 // indirect
	golang.org/x/crypto v0.36.0 // indirect
	golang.org/x/net v0.37.0 // indirect
	golang.org/x/sys v0.33.0 // indirect
	gopkg.in/check.v1 v1.0.0-20201130134442-10cb98267c6c // indirect
	gopkg.in/src-d/go-billy.v4 v4.3.2 // indirect
	gopkg.in/warnings.v0 v0.1.2 // indirect
)
