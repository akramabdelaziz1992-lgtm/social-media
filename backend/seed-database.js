const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const db = new Database('almasar.db');

// Enable foreign keys
db.pragma('foreign_keys = ON');

try {
  // Get admin user ID
  const adminUser = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@elmasarelsa5en.com');
  
  if (!adminUser) {
    console.error('❌ Admin user not found!');
    process.exit(1);
  }

  const adminId = adminUser.id;
  console.log('✅ Admin user found:', adminId);

  // Clear existing data (in reverse order due to foreign keys)
  try {
    db.prepare('DELETE FROM messages').run();
  } catch (e) {}
  
  try {
    db.prepare('DELETE FROM conversations').run();
  } catch (e) {}
  
  try {
    db.prepare('DELETE FROM channels').run();
  } catch (e) {}
  
  try {
    db.prepare('DELETE FROM templates').run();
  } catch (e) {}
  
  try {
    db.prepare('DELETE FROM auto_reply_rules').run();
  } catch (e) {}

  // 1. Add channels
  const channels = [
    {
      id: uuidv4(),
      type: 'whatsapp',
      name: 'واتس آب الدعم',
      credentials: JSON.stringify({ phoneNumber: '+966501234567' }),
      status: 'active',
      isActive: true,
    },
    {
      id: uuidv4(),
      type: 'telegram',
      name: 'تلجرام العملاء',
      credentials: JSON.stringify({ botToken: 'token123' }),
      status: 'active',
      isActive: true,
    },
    {
      id: uuidv4(),
      type: 'email',
      name: 'البريد الإلكتروني',
      credentials: JSON.stringify({ email: 'support@example.com' }),
      status: 'active',
      isActive: true,
    },
  ];

  const channelIds = [];
  for (const channel of channels) {
    try {
      db.prepare(`
        INSERT INTO channels (id, type, name, credentials, status, isActive, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(channel.id, channel.type, channel.name, channel.credentials, channel.status, channel.isActive ? 1 : 0);
      channelIds.push(channel.id);
      console.log('✅ Added channel:', channel.name);
    } catch (err) {
      console.error('❌ Error adding channel:', err.message);
    }
  }

  // 2. Add templates
  const templates = [
    {
      id: uuidv4(),
      name: 'ترحيب بالعميل',
      description: 'رسالة ترحيب أولية',
      channelType: 'whatsapp',
      channelId: channelIds[0],
      content: 'أهلاً وسهلاً! نحن هنا لمساعدتك. كيف يمكننا خدمتك؟',
      category: 'greeting',
      isActive: true,
    },
    {
      id: uuidv4(),
      name: 'شكر العميل',
      description: 'رسالة شكر',
      channelType: 'whatsapp',
      channelId: channelIds[0],
      content: 'شكراً لتواصلك معنا! نقدر تعاملك معنا.',
      category: 'thanks',
      isActive: true,
    },
    {
      id: uuidv4(),
      name: 'وقت العمل',
      description: 'معلومات عن وقت العمل',
      channelType: 'telegram',
      channelId: channelIds[1],
      content: 'ساعات عملنا: من الأحد إلى الخميس 9 صباحاً إلى 6 مساءً',
      category: 'info',
      isActive: true,
    },
  ];

  const templateIds = [];
  for (const template of templates) {
    db.prepare(`
      INSERT INTO templates (id, name, description, channelType, channelId, content, category, isActive, usageCount, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `).run(template.id, template.name, template.description, template.channelType, template.channelId, template.content, template.category, template.isActive ? 1 : 0);
    templateIds.push(template.id);
    console.log('✅ Added template:', template.name);
  }

  // 3. Add auto-reply rules
  const autoReplyRules = [
    {
      id: uuidv4(),
      name: 'رد تلقائي للترحيب',
      description: 'يرد على الترحيب تلقائياً',
      channelId: channelIds[0],
      channelType: 'whatsapp',
      department: 'support',
      triggers: JSON.stringify(['السلام عليكم', 'مرحبا', 'هلا']),
      templateId: templateIds[0],
      enabled: true,
      priority: 1,
    },
    {
      id: uuidv4(),
      name: 'رد عن أوقات العمل',
      description: 'يرد على الأسئلة عن أوقات العمل',
      channelId: channelIds[1],
      channelType: 'telegram',
      department: 'general',
      triggers: JSON.stringify(['وقت العمل', 'متى تفتحون', 'ساعات العمل']),
      templateId: templateIds[2],
      enabled: true,
      priority: 2,
    },
  ];

  for (const rule of autoReplyRules) {
    db.prepare(`
      INSERT INTO auto_reply_rules (id, name, description, channelId, channelType, department, triggers, templateId, enabled, priority, executionCount, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `).run(rule.id, rule.name, rule.description, rule.channelId, rule.channelType, rule.department, rule.triggers, rule.templateId, rule.enabled ? 1 : 0, rule.priority);
    console.log('✅ Added auto-reply rule:', rule.name);
  }

  // 4. Add conversations
  const conversationIds = [];
  const conversations = [
    {
      id: uuidv4(),
      channelId: channelIds[0],
      externalThreadId: 'thread_001',
      assignedToUserId: adminId,
      department: 'support',
      customerProfile: JSON.stringify({ name: 'أحمد محمد', phone: '+966501111111' }),
      privacyScope: 'public',
      status: 'open',
      unreadCount: 2,
      tags: JSON.stringify(['عاجل', 'شكوى']),
      notes: 'عميل جديد يحتاج دعم فني',
    },
    {
      id: uuidv4(),
      channelId: channelIds[1],
      externalThreadId: 'thread_002',
      assignedToUserId: adminId,
      department: 'sales',
      customerProfile: JSON.stringify({ name: 'فاطمة علي', phone: '+966502222222' }),
      privacyScope: 'public',
      status: 'pending',
      unreadCount: 1,
      tags: JSON.stringify(['بيع', 'استفسار']),
      notes: 'استفسار عن المنتجات',
    },
    {
      id: uuidv4(),
      channelId: channelIds[2],
      externalThreadId: 'thread_003',
      assignedToUserId: adminId,
      department: 'general',
      customerProfile: JSON.stringify({ name: 'محمد سالم', email: 'mohammed@example.com' }),
      privacyScope: 'private',
      status: 'closed',
      unreadCount: 0,
      tags: JSON.stringify(['بريد']),
      notes: 'محادثة منتهية',
    },
  ];

  for (const conversation of conversations) {
    db.prepare(`
      INSERT INTO conversations (id, channelId, externalThreadId, assignedToUserId, department, customerProfile, privacyScope, status, unreadCount, tags, notes, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).run(
      conversation.id,
      conversation.channelId,
      conversation.externalThreadId,
      conversation.assignedToUserId,
      conversation.department,
      conversation.customerProfile,
      conversation.privacyScope,
      conversation.status,
      conversation.unreadCount,
      conversation.tags,
      conversation.notes
    );
    conversationIds.push(conversation.id);
    console.log('✅ Added conversation:', conversation.externalThreadId);
  }

  // 5. Add messages
  const messages = [
    {
      conversationId: conversationIds[0],
      senderType: 'customer',
      senderId: 'customer_001',
      text: 'السلام عليكم، أحتاج مساعدة في المنتج',
      status: 'delivered',
      externalMessageId: 'msg_001',
    },
    {
      conversationId: conversationIds[0],
      senderType: 'agent',
      senderId: adminId,
      text: 'وعليكم السلام ورحمة الله وبركاته! كيف يمكننا مساعدتك؟',
      status: 'delivered',
      externalMessageId: 'msg_002',
      isAutoReply: true,
    },
    {
      conversationId: conversationIds[0],
      senderType: 'customer',
      senderId: 'customer_001',
      text: 'المنتج لا يعمل بشكل صحيح',
      status: 'delivered',
      externalMessageId: 'msg_003',
    },
    {
      conversationId: conversationIds[1],
      senderType: 'customer',
      senderId: 'customer_002',
      text: 'هل لديكم عروض خاصة؟',
      status: 'delivered',
      externalMessageId: 'msg_004',
    },
    {
      conversationId: conversationIds[1],
      senderType: 'agent',
      senderId: adminId,
      text: 'نعم لدينا عروض رائعة! دعني أرسل لك التفاصيل',
      status: 'delivered',
      externalMessageId: 'msg_005',
    },
    {
      conversationId: conversationIds[2],
      senderType: 'customer',
      senderId: 'customer_003',
      text: 'شكراً لكم على الخدمة الممتازة',
      status: 'read',
      externalMessageId: 'msg_006',
    },
    {
      conversationId: conversationIds[2],
      senderType: 'agent',
      senderId: adminId,
      text: 'شكراً لتقييمك، نتطلع لخدمتك مجدداً',
      status: 'read',
      externalMessageId: 'msg_007',
    },
  ];

  for (const message of messages) {
    let senderId = message.senderId;
    
    // Only use admin ID for agent messages
    if (message.senderType === 'agent') {
      senderId = adminId;
    } else {
      // For customer messages, use a placeholder that won't trigger foreign key
      senderId = null;
    }

    db.prepare(`
      INSERT INTO messages (id, conversationId, senderType, senderId, text, status, externalMessageId, isAutoReply, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      uuidv4(),
      message.conversationId,
      message.senderType,
      senderId,
      message.text,
      message.status,
      message.externalMessageId,
      message.isAutoReply ? 1 : 0
    );
  }

  console.log('✅ Added', messages.length, 'messages');

  console.log('\n✅ ✅ ✅ تم إضافة جميع البيانات بنجاح!');
  console.log('\n📊 ملخص البيانات المضافة:');
  console.log('- ' + channels.length + ' قنوات');
  console.log('- ' + templates.length + ' قوالب');
  console.log('- ' + autoReplyRules.length + ' قوانين ردود تلقائية');
  console.log('- ' + conversationIds.length + ' محادثات');
  console.log('- ' + messages.length + ' رسالة');

  process.exit(0);
} catch (error) {
  console.error('❌ خطأ:', error.message);
  process.exit(1);
}
