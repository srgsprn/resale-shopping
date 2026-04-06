-- Отдельный логин для входа (админка и «логин или email» на сайте)
ALTER TABLE "CredentialUser" ADD COLUMN "login" TEXT;

CREATE UNIQUE INDEX "CredentialUser_login_key" ON "CredentialUser"("login");
