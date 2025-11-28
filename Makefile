ENGINE?=podman
CTNAME?=mcullenm_dev
# Note: there is whitespace after sudo
PREFIX?=sudo 

# Lowdown is a pre-requisite, ensure it is installed (handled by install command if used)

build-start: generate-dist build-h2o run-h2o

rebuild: stop-h2o remove-h2o generate-dist build-h2o run-h2o

install: dependencies pull-image generate-dist build-h2o create-h2o systemd

dependencies:
	./setup/sys-dep

systemd:
	./setup/systemd

pull-image: 
	$(PREFIX)$(ENGINE) pull docker.io/lkwg82/h2o-http2-server

auto-rebuild:
	inotifywait -m -q -e modify src/* | while read l; do make rebuild; done

build-h2o:
	$(PREFIX)$(ENGINE) build -t mcullenm_dev_h2o .

generate-dist:
	./tools/generate.sh

create-h2o:
	$(PREFIX)$(ENGINE) create --name $(CTNAME) -p 8081:8080 mcullenm_dev_h2o

run-h2o:
	$(PREFIX)$(ENGINE) run --name $(CTNAME) -p 8081:8080 -d mcullenm_dev_h2o

start-h2o:
	$(PREFIX)$(ENGINE) container start $(CTNAME)

stop-h2o:
	$(PREFIX)$(ENGINE) container stop $(CTNAME)

remove-h2o:
	$(PREFIX)$(ENGINE) container rm $(CTNAME)

