# 会议室预定系统-后台

（用于学习nestjs后台框架）

技术栈：前端是 antd + react + cra，后端是 nest + typeorm，数据库是 mysql + redis，API 文档用 swagger 生成，部署用 docker compose + pm2，网关使用 nginx。

数据库表有 8 个：用户表 users、会议室表 meeting_rooms、预订表 bookings、预订-参会者表 booking_attendees、角色表 roles、权限表 permissions、用户-角色表 user_roles、角色-权限表 role_permissions。

模块有 4 个：用户管理模块、会议室管理模块、预订管理模块、统计管理模块。

角色有两个：普通用户、管理员。使用 RBAC 来控制接口访问权限。
