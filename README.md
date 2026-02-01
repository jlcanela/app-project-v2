
## Run test with test container

```
export DOCKER_HOST=unix:///mnt/wsl/podman-sockets/podman-machine-default/podman-root.sock
```

```
podman run --rm -p 3001:3000 --platform=linux/amd64 gorules/editor
```

```
pnpm dlx @modelcontextprotocol/inspector
```
