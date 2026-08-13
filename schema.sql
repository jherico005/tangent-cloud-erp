-- ============================================================================
-- Tangents Dispatcher & eFSR Management System
-- Azure SQL / Microsoft SQL Server Schema: ChatMessages Table
-- ============================================================================

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ChatMessages]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[ChatMessages] (
        [id] NVARCHAR(100) NOT NULL PRIMARY KEY,
        [senderId] NVARCHAR(100) NOT NULL,
        [senderName] NVARCHAR(255) NOT NULL,
        [senderRole] NVARCHAR(100) NOT NULL, -- e.g. 'Department Admin', 'Super Admin', 'Field Technician'
        [receiverId] NVARCHAR(100) NOT NULL, -- 'ALL' for broadcasts, or specific user ID / FT ID
        [receiverName] NVARCHAR(255) NULL,
        [ticketId] NVARCHAR(100) NULL, -- Optional link to SRN Number (e.g. '2026INS0015870') or eFSR Number (e.g. 'FSR-2026-0801')
        [ticketType] NVARCHAR(50) NULL, -- 'SRN' | 'eFSR' | 'Merchant'
        [message] NVARCHAR(MAX) NOT NULL,
        [timestamp] DATETIME2 NOT NULL DEFAULT GETDATE(),
        [status] NVARCHAR(50) NOT NULL DEFAULT 'Sent', -- 'Sending' | 'Sent' | 'Delivered' | 'Read'
        [isRead] BIT NOT NULL DEFAULT 0,
        [attachmentUrl] NVARCHAR(MAX) NULL,
        [attachmentName] NVARCHAR(255) NULL,
        [createdAt] DATETIME2 NOT NULL DEFAULT GETDATE()
    );

    -- Create indexes for quick query performance on conversations & tickets
    CREATE INDEX IX_ChatMessages_SenderReceiver ON [dbo].[ChatMessages] ([senderId], [receiverId]);
    CREATE INDEX IX_ChatMessages_TicketId ON [dbo].[ChatMessages] ([ticketId]);
    CREATE INDEX IX_ChatMessages_Timestamp ON [dbo].[ChatMessages] ([timestamp] DESC);
END;
GO
