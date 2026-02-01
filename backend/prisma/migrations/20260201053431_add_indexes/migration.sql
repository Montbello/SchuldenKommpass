-- CreateIndex
CREATE INDEX "Appointment_userId_idx" ON "Appointment"("userId");

-- CreateIndex
CREATE INDEX "Appointment_advisorId_idx" ON "Appointment"("advisorId");

-- CreateIndex
CREATE INDEX "Appointment_start_time_idx" ON "Appointment"("start_time");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");

-- CreateIndex
CREATE INDEX "Certificate_issued_date_idx" ON "Certificate"("issued_date");

-- CreateIndex
CREATE INDEX "Document_userId_idx" ON "Document"("userId");

-- CreateIndex
CREATE INDEX "Document_document_category_idx" ON "Document"("document_category");

-- CreateIndex
CREATE INDEX "Document_verification_status_idx" ON "Document"("verification_status");

-- CreateIndex
CREATE INDEX "Match_userId_idx" ON "Match"("userId");

-- CreateIndex
CREATE INDEX "Match_taskId_idx" ON "Match"("taskId");

-- CreateIndex
CREATE INDEX "Match_status_idx" ON "Match"("status");

-- CreateIndex
CREATE INDEX "Progress_userId_status_idx" ON "Progress"("userId", "status");

-- CreateIndex
CREATE INDEX "Progress_taskId_idx" ON "Progress"("taskId");

-- CreateIndex
CREATE INDEX "Progress_updated_at_idx" ON "Progress"("updated_at");

-- CreateIndex
CREATE INDEX "Skill_userId_idx" ON "Skill"("userId");

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "Skill"("category");

-- CreateIndex
CREATE INDEX "Task_organisationId_idx" ON "Task"("organisationId");

-- CreateIndex
CREATE INDEX "Task_active_idx" ON "Task"("active");

-- CreateIndex
CREATE INDEX "Task_required_skill_idx" ON "Task"("required_skill");

-- CreateIndex
CREATE INDEX "User_institution_id_idx" ON "User"("institution_id");

-- CreateIndex
CREATE INDEX "User_onboarding_status_idx" ON "User"("onboarding_status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");
