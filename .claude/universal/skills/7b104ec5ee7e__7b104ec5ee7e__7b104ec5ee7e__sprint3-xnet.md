# Sprint 3 — XNET Networking Module Design & Scaffold

XNET is the zero-copy, freestanding network stack for GEN.OS.
Target: Sprint 3. Depends on: XENOS (Sprint 1), XDISP/XCOMP (Sprint 2).

## Architecture

```
net/xnet/
├── include/
│   ├── xnet.h          # Public API: xnet_init, xnet_socket, xnet_send, xnet_recv
│   ├── xnet_types.h    # xnet_addr_t, xnet_socket_t, xnet_buf_t
│   └── xnet_proto.h    # Protocol constants (ETH, IP, TCP, UDP frame offsets)
├── xnet_core.c         # xnet_init(), socket registry, interface management
├── xnet_eth.c          # Ethernet frame TX/RX (DMA descriptor ring)
├── xnet_ip.c           # IPv4/IPv6 header processing
├── xnet_tcp.c          # TCP state machine (LISTEN/SYN/ESTAB/CLOSE)
├── xnet_udp.c          # UDP TX/RX — stateless
├── xnet_dns.c          # DNS resolver (UDP, iterative, no recursion)
└── xnet_buf.c          # Zero-copy ring buffer (DMA-safe, aligned)
```

## Design Constraints

| Constraint | Specification |
|------------|--------------|
| Memory model | Static pools only — no malloc. Ring buffers for DMA. |
| Alignment | All DMA buffers: `__attribute__((aligned(4096)))` |
| MTU | Default 1500B; Jumbo frames (9000B) via compile flag |
| XKABI right | `XK_RIGHT_NET_SEND`, `XK_RIGHT_NET_RECV` |
| PAL dependency | `pal_spin_lock()`, `pal_console_printf()`, `pal_handle_t` |
| Zero-copy | DMA descriptor ownership model — CPU never copies payload |
| Driver target | Intel I219-V NIC (HP EliteBook x360 1030 G4) |

## `xnet.h` Public API Sketch

```c
#ifndef GENOS_XNET_H
#define GENOS_XNET_H

#ifndef PAL_FREESTANDING
#define PAL_FREESTANDING
#endif
#include "../../pal/include/pal.h"

typedef struct { uint8_t octets[4]; }  xnet_ipv4_t;
typedef struct { uint8_t octets[6]; }  xnet_mac_t;
typedef uint16_t xnet_port_t;
typedef uint32_t xnet_socket_id_t;  /* 0 = invalid */

/* Initialise XNET — call from kmain() after PMM/VMM init */
int  xnet_init(void);

/* Open a socket. proto: XNET_PROTO_TCP | XNET_PROTO_UDP */
xnet_socket_id_t xnet_socket(uint8_t proto);

/* Bind socket to local port */
int  xnet_bind(xnet_socket_id_t sock, xnet_port_t port);

/* Send data (zero-copy: buf must be DMA-aligned, pool-owned) */
int  xnet_send(xnet_socket_id_t sock, const void *buf, uint32_t len,
               const xnet_ipv4_t *dst, xnet_port_t dst_port);

/* Receive — returns bytes received, 0 if no data, -1 on error */
int  xnet_recv(xnet_socket_id_t sock, void *buf, uint32_t max_len);

/* Close and free socket */
void xnet_close(xnet_socket_id_t sock);

#define XNET_PROTO_TCP  6U
#define XNET_PROTO_UDP  17U

#endif /* GENOS_XNET_H */
```

## Compile Check Command

```bash
clang -target x86_64-unknown-none-elf -ffreestanding -fno-stack-protector \
      -fno-pie -mno-red-zone -mno-mmx -mno-sse -mno-sse2 \
      -Wall -Wextra -Werror -O2 -std=c11 -fsyntax-only \
      -Ipal/include -Ikernel/xenos/include -Inet/xnet/include -D__x86_64__ \
      net/xnet/xnet_core.c net/xnet/xnet_eth.c net/xnet/xnet_ip.c \
      net/xnet/xnet_tcp.c net/xnet/xnet_udp.c net/xnet/xnet_buf.c
```

## Agent Assignments

| Module | Agent |
|--------|-------|
| xnet_core.c, xnet.h | apex-systems-architect |
| xnet_eth.c (DMA rings) | hardware-integration-engineer |
| xnet_tcp.c (state machine) | event-horizon-agent |
| xnet_ip.c, xnet_udp.c | apex-systems-architect |
| xnet_buf.c (zero-copy) | performance-forge |
| XKABI rights design | guardian-sentinel |
| Tests | test-forge |
