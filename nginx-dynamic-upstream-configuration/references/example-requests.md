# 典型请求示例

## 查看配置
- 查看整个 upstream 组：
  ```
  GET /upstream_conf?upstream=backend
  ```
- 查看特定服务器：
  ```
  GET /upstream_conf?upstream=backend&id=42
  ```

## 添加服务器
- 添加主服务器：
  ```
  GET /upstream_conf?add=&upstream=backend&server=127.0.0.1
  ```
- 添加带权重的备份服务器：
  ```
  GET /upstream_conf?add=&upstream=backend&backup=&server=backup.example.com&weight=2
  ```

## 修改服务器状态
- 标记为不可用：
  ```
  GET /upstream_conf?upstream=backend&id=42&down=
  ```
- 恢复可用：
  ```
  GET /upstream_conf?upstream=backend&id=42&up=
  ```
- 启用排水模式：
  ```
  GET /upstream_conf?upstream=backend&id=42&drain=
  ```

## 删除服务器
- 删除指定服务器：
  ```
  GET /upstream_conf?remove=&upstream=backend&id=42
  ```