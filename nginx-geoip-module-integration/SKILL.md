---
name: nginx-geoip-module-integration
description: 在nginx中集成MaxMind GeoIP数据库并生成地理位置变量。当配置文件中使用geoip_country、geoip_city或geoip_org指令时，使用此技能来正确设置模块、加载数据库并理解自动生成的变量。
---

# Nginx GeoIP 模块集成与变量生成

## 使用前提

1. **编译支持**：确保nginx在编译时添加了 `--with-http_geoip_module` 参数。
2. **依赖库**：系统已安装 MaxMind GeoIP C 库。
3. **数据库文件**：提供有效的 MaxMind `.dat` 格式数据库文件（如 GeoLite Country/City/Org）。

## 配置步骤

### 1. 在 http 上下文中加载数据库

根据所需信息类型，选择对应的指令：

- **国家级数据**：
  ```nginx
  geoip_country /path/to/GeoIP.dat;
  ```
  生成变量：`$geoip_country_code`、`$geoip_country_code3`、`$geoip_country_name`

- **城市级数据**：
  ```nginx
  geoip_city /path/to/GeoLiteCity.dat;
  ```
  生成变量包括：`$geoip_city`、`$geoip_region`、`$geoip_latitude`、`$geoip_longitude` 等

- **组织数据（nginx ≥1.0.3）**：
  ```nginx
  geoip_org /path/to/GeoIPASNum.dat;
  ```
  生成变量：`$geoip_org`

### 2. 处理代理请求（可选）

若服务位于反向代理后，需配置可信代理以正确识别客户端IP：

```nginx
geoip_proxy 192.168.0.0/16;
geoip_proxy 2001:db8::/32;
geoip_proxy_recursive on;  # 使用最后一个不可信地址
```

### 3. IPv6 支持说明

- nginx ≥1.3.12 或 ≥1.2.7 支持 IPv6 数据库。
- IPv4 地址会自动转换为 IPv4 映射的 IPv6 地址（如 `::ffff:192.0.2.1`）进行查询。

## 触发条件

当nginx配置中出现以下任一指令时，应应用本技能：
- `geoip_country`
- `geoip_city`
- `geoip_org`

## 输出结果

模块根据客户端IP在MaxMind数据库中查找对应地理或组织信息，并自动填充预定义的nginx变量，供后续配置（如日志、访问控制、重定向）使用。