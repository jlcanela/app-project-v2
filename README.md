
## Run test with test container

```
export DOCKER_HOST=unix:///mnt/wsl/podman-sockets/podman-machine-default/podman-root.sock
```

```
podman  run -p 3000:3000 --platform=linux/amd64 gorules/editor
```

