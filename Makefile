.PHONY: all clean challenge-buttons challenge-demo challenge-mui challenge-robot challenge-towers landing

all: clean challenge-buttons challenge-demo challenge-mui challenge-robot challenge-towers landing

clean:
	rm -rf dist

challenge-buttons:
	VITE_CHALLENGE=buttons \
	BUILD_BASE=/challenge-buttons-a9808c5e/ \
	BUILD_OUT=dist/challenge-buttons-a9808c5e \
	pnpm run build

challenge-demo:
	VITE_CHALLENGE=demo \
	BUILD_BASE=/challenge-demo-dfa0d580/ \
	BUILD_OUT=dist/challenge-demo-dfa0d580 \
	pnpm run build

challenge-mui:
	VITE_CHALLENGE=mui \
	BUILD_BASE=/challenge-mui-168af805/ \
	BUILD_OUT=dist/challenge-mui-168af805 \
	pnpm run build

challenge-robot:
	VITE_CHALLENGE=robot \
	BUILD_BASE=/challenge-robot-d34b4b04/ \
	BUILD_OUT=dist/challenge-robot-d34b4b04 \
	pnpm run build

challenge-towers:
	VITE_CHALLENGE=towers \
	BUILD_BASE=/challenge-towers-6d3a20be/ \
	BUILD_OUT=dist/challenge-towers-6d3a20be \
	pnpm run build

landing: challenge-buttons challenge-demo challenge-mui challenge-robot challenge-towers
	cp landing.html dist/index.html

