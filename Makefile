ENGINE?=podman
CTNAME?=mcullenm_dev

build-start: generate-dist build-h2o create-h2o

rebuild: stop-h2o remove-h2o generate-dist build-h2o create-h2o

auto-rebuild:
	inotifywait -m -q -e modify src/* | while read l; do make rebuild; done

build-h2o:
	$(ENGINE) build -t mcullenm_dev_h2o .

generate-dist:
	./tools/generate.sh

create-h2o:
	$(ENGINE) run --name $(CTNAME) -p 8080:8080 -d mcullenm_dev_h2o

start-h2o:
	$(ENGINE) container start $(CTNAME)

stop-h2o:
	$(ENGINE) container stop $(CTNAME)

remove-h2o:
	$(ENGINE) container rm $(CTNAME)

