import mongoose from 'mongoose';
import {
  User,
  Paste,
  ShortenedUrl,
  TerminalSession,
  TerminalCommand,
  Sprint,
  Issue,
  IssueComment,
  IssueHistory,
  UserHistory
} from '../models';

// MongoDB query interface compatible with PostgreSQL pool.query
export const query = async (text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> => {
  // Use existing mongoose connection
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB not connected');
  }

  const normalizedText = text.toLowerCase().trim();

  if (normalizedText.startsWith('select')) {
    return handleSelect(text, params);
  }

  if (normalizedText.startsWith('insert')) {
    return handleInsert(text, params);
  }

  if (normalizedText.startsWith('update')) {
    return handleUpdate(text, params);
  }

  if (normalizedText.startsWith('delete')) {
    return handleDelete(text, params);
  }

  throw new Error(`Unsupported query type: ${text.substring(0, 50)}`);
};

async function handleSelect(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
  const normalizedText = text.toLowerCase();

  // Users queries
  if (normalizedText.includes('from users')) {
    if (normalizedText.includes('where email =')) {
      const email = params?.[0];
      const user = await User.findOne({ email }).lean();
      return { rows: user ? [convertId(user)] : [], rowCount: user ? 1 : 0 };
    }
    if (normalizedText.includes('where email = $1 or username = $2')) {
      const [email, username] = params || [];
      const user = await User.findOne({ $or: [{ email }, { username }] }).lean();
      return { rows: user ? [convertId(user)] : [], rowCount: user ? 1 : 0 };
    }
    if (normalizedText.includes('where username = $1 or email = $1')) {
      const username = params?.[0];
      const user = await User.findOne({ $or: [{ username }, { email: username }] }).lean();
      return { rows: user ? [convertId(user)] : [], rowCount: user ? 1 : 0 };
    }
    if (normalizedText.includes('where id =')) {
      const id = params?.[0];
      const user = await User.findById(id).lean();
      return { rows: user ? [convertId(user)] : [], rowCount: user ? 1 : 0 };
    }
  }

  // Pastes queries
  if (normalizedText.includes('from pastes')) {
    if (normalizedText.includes('select count') && normalizedText.includes('where user_id =')) {
      const userId = params?.[0];
      const count = await Paste.countDocuments({ user_id: userId });
      return { rows: [{ count }], rowCount: 1 };
    }
    if (normalizedText.includes('select count')) {
      const count = await Paste.countDocuments();
      return { rows: [{ count }], rowCount: 1 };
    }
    if (normalizedText.includes('where paste_id =')) {
      const pasteId = params?.[0];
      const paste = await Paste.findOne({ paste_id: pasteId }).lean();
      return { rows: paste ? [convertId(paste)] : [], rowCount: paste ? 1 : 0 };
    }
    if (normalizedText.includes('where user_id =')) {
      const userId = params?.[0];
      const limit = params?.[1] || 50;
      const pastes = await Paste.find({ user_id: userId }).sort({ created_at: -1 }).limit(Number(limit)).lean();
      return { rows: pastes.map(convertId), rowCount: pastes.length };
    }
    if (normalizedText.includes('where expires_at < now()')) {
      const pastes = await Paste.find({ expires_at: { $lt: new Date() } }).lean();
      return { rows: pastes.map(convertId), rowCount: pastes.length };
    }
  }

  // Shortened URLs queries
  if (normalizedText.includes('from shortened_urls')) {
    if (normalizedText.includes('select count') && normalizedText.includes('where user_id =')) {
      const userId = params?.[0];
      const count = await ShortenedUrl.countDocuments({ user_id: userId });
      return { rows: [{ count }], rowCount: 1 };
    }
    if (normalizedText.includes('select count')) {
      const count = await ShortenedUrl.countDocuments();
      return { rows: [{ count }], rowCount: 1 };
    }
    if (normalizedText.includes('where short_id =')) {
      const shortId = params?.[0];
      const url = await ShortenedUrl.findOne({ short_id: shortId }).lean();
      return { rows: url ? [convertId(url)] : [], rowCount: url ? 1 : 0 };
    }
    if (normalizedText.includes('where user_id =')) {
      const userId = params?.[0];
      const urls = await ShortenedUrl.find({ user_id: userId }).sort({ created_at: -1 }).lean();
      return { rows: urls.map(convertId), rowCount: urls.length };
    }
  }

  // Terminal sessions queries
  if (normalizedText.includes('from terminal_sessions')) {
    if (normalizedText.includes('where session_id =')) {
      const sessionId = params?.[0];
      const session = await TerminalSession.findOne({ session_id: sessionId }).lean();
      return { rows: session ? [convertId(session)] : [], rowCount: session ? 1 : 0 };
    }
    if (normalizedText.includes('where user_id =')) {
      const userId = params?.[0];
      const sessions = await TerminalSession.find({ user_id: userId }).sort({ created_at: -1 }).lean();
      return { rows: sessions.map(convertId), rowCount: sessions.length };
    }
  }

  // Terminal commands queries
  if (normalizedText.includes('from terminal_commands')) {
    if (normalizedText.includes('where session_id =')) {
      const sessionId = params?.[0];
      const commands = await TerminalCommand.find({ session_id: sessionId }).sort({ executed_at: -1 }).lean();
      return { rows: commands.map(convertId), rowCount: commands.length };
    }
  }

  // Issues queries
  if (normalizedText.includes('from issues')) {
    return handleIssuesSelect(text, params);
  }

  // Sprints queries
  if (normalizedText.includes('from sprints')) {
    if (normalizedText.includes('where state =')) {
      const state = params?.[0];
      const sprints = await Sprint.find({ state }).sort({ created_at: -1 }).lean();
      return { rows: sprints.map(convertId), rowCount: sprints.length };
    }
    const sprints = await Sprint.find().sort({ created_at: -1 }).lean();
    return { rows: sprints.map(convertId), rowCount: sprints.length };
  }

  // Issue comments queries
  if (normalizedText.includes('from issue_comments')) {
    if (normalizedText.includes('where issue_id =')) {
      const issueId = params?.[0];
      const comments = await IssueComment.find({ issue_id: issueId }).sort({ created_at: 1 }).lean();
      return { rows: comments.map(convertId), rowCount: comments.length };
    }
  }

  // Issue history queries
  if (normalizedText.includes('from issue_history')) {
    if (normalizedText.includes('where issue_id =')) {
      const issueId = params?.[0];
      const history = await IssueHistory.find({ issue_id: issueId }).sort({ created_at: -1 }).lean();
      return { rows: history.map(convertId), rowCount: history.length };
    }
  }

  // User history queries
  if (normalizedText.includes('from user_history')) {
    if (normalizedText.includes('where user_id =')) {
      const userId = params?.[0];
      const history = await UserHistory.find({ user_id: userId }).sort({ created_at: -1 }).limit(100).lean();
      return { rows: history.map(convertId), rowCount: history.length };
    }
  }

  console.warn(`Unhandled SELECT query: ${text.substring(0, 100)}`);
  return { rows: [], rowCount: 0 };
}

async function handleIssuesSelect(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
  const normalizedText = text.toLowerCase();
  let filter: any = {};
  let issueId: string | null = null;

  if (normalizedText.includes('where i.id = $1')) {
    issueId = params?.[0];
    filter = { _id: issueId };
  }

  if (normalizedText.includes('where 1=1')) {
    let paramIndex = 0;
    if (normalizedText.includes('i.status =')) {
      const status = params?.[paramIndex++];
      if (status) filter.status = status;
    }
    if (normalizedText.includes('i.sprint_id =')) {
      const sprintId = params?.[paramIndex++];
      if (sprintId) filter.sprint_id = sprintId;
    }
    if (normalizedText.includes('i.assignee_id =')) {
      const assigneeId = params?.[paramIndex++];
      if (assigneeId) filter.assignee_id = assigneeId;
    }
    if (normalizedText.includes('i.type =')) {
      const type = params?.[paramIndex++];
      if (type) filter.type = type;
    }
    if (normalizedText.includes('(i.title ilike') && params) {
      const searchTerm = params[paramIndex];
      if (searchTerm) {
        const regex = new RegExp(searchTerm.replace(/%/g, ''), 'i');
        filter.$or = [{ title: regex }, { description: regex }, { key: regex }];
      }
    }
  }

  const issues = await Issue.find(filter)
    .populate('assignee_id', 'username')
    .populate('reporter_id', 'username')
    .populate('sprint_id', 'name')
    .sort({ created_at: -1 })
    .lean();

  const transformed = issues.map((issue: any) => ({
    ...convertId(issue),
    assignee_name: issue.assignee_id?.username,
    reporter_name: issue.reporter_id?.username,
    sprint_name: issue.sprint_id?.name
  }));

  return { rows: transformed, rowCount: transformed.length };
}

async function handleInsert(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
  const normalizedText = text.toLowerCase();

  if (normalizedText.includes('into users')) {
    const [email, username, password_hash] = params || [];
    const user = new User({ email, username, password_hash });
    await user.save();
    return { rows: [convertId(user.toObject())], rowCount: 1 };
  }

  if (normalizedText.includes('into pastes')) {
    const [paste_id, userId, content, contentType, fileData, fileName, fileSize, expiresAt, deleteToken, slug] = params || [];
    const paste = new Paste({
      paste_id, user_id: userId, content, content_type: contentType,
      file_data: fileData, file_name: fileName, file_size: fileSize,
      expires_at: expiresAt, delete_token: deleteToken, slug
    });
    await paste.save();
    return { rows: [convertId(paste.toObject())], rowCount: 1 };
  }

  if (normalizedText.includes('into shortened_urls')) {
    const [short_id, original_url, userId, clicks] = params || [];
    const url = new ShortenedUrl({ short_id, original_url, user_id: userId, clicks: clicks || 0 });
    await url.save();
    return { rows: [convertId(url.toObject())], rowCount: 1 };
  }

  if (normalizedText.includes('into terminal_sessions')) {
    const [session_id, userId, name, status] = params || [];
    const session = new TerminalSession({ session_id, user_id: userId, name, status: status || 'active' });
    await session.save();
    return { rows: [convertId(session.toObject())], rowCount: 1 };
  }

  if (normalizedText.includes('into terminal_commands')) {
    const [session_id, userId, command, stdout, stderr, exitCode, workingDir] = params || [];
    const cmd = new TerminalCommand({
      session_id, user_id: userId, command, stdout, stderr,
      exit_code: exitCode, working_directory: workingDir
    });
    await cmd.save();
    return { rows: [convertId(cmd.toObject())], rowCount: 1 };
  }

  if (normalizedText.includes('into sprints')) {
    const [name, goal, state, startDate, endDate, createdBy] = params || [];
    const sprint = new Sprint({ name, goal, state, start_date: startDate, end_date: endDate, created_by: createdBy });
    await sprint.save();
    return { rows: [convertId(sprint.toObject())], rowCount: 1 };
  }

  if (normalizedText.includes('into issues')) {
    return handleIssuesInsert(text, params);
  }

  if (normalizedText.includes('into issue_comments')) {
    const [issueId, userId, content] = params || [];
    const comment = new IssueComment({ issue_id: issueId, user_id: userId, content });
    await comment.save();
    return { rows: [convertId(comment.toObject())], rowCount: 1 };
  }

  if (normalizedText.includes('into issue_history')) {
    const [issueId, userId, field, oldValue, newValue] = params || [];
    const history = new IssueHistory({ issue_id: issueId, user_id: userId, field, old_value: oldValue, new_value: newValue });
    await history.save();
    return { rows: [convertId(history.toObject())], rowCount: 1 };
  }

  if (normalizedText.includes('into user_history')) {
    const [userId, itemType, itemId, fileName, fileSize, contentType, action, metadata] = params || [];
    const history = new UserHistory({
      user_id: userId, item_type: itemType, item_id: itemId,
      file_name: fileName, file_size: fileSize, content_type: contentType,
      action, metadata
    });
    await history.save();
    return { rows: [convertId(history.toObject())], rowCount: 1 };
  }

  console.warn(`Unhandled INSERT query: ${text.substring(0, 100)}`);
  return { rows: [], rowCount: 0 };
}

async function handleIssuesInsert(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
  const [key, title, description, type, priority, status, assignee_id, reporter_id, sprint_id, parent_id,
    story_points, labels, due_date, estimated_hours, actual_hours] = params || [];

  const issue = new Issue({
    key, title, description, type, priority, status, assignee_id, reporter_id,
    sprint_id, parent_id, story_points, labels, due_date, estimated_hours, actual_hours
  });

  await issue.save();
  return { rows: [convertId(issue.toObject())], rowCount: 1 };
}

async function handleUpdate(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
  const normalizedText = text.toLowerCase();

  if (normalizedText.includes('shortened_urls') && normalizedText.includes('clicks = clicks + 1')) {
    const shortId = params?.[0];
    await ShortenedUrl.updateOne({ short_id: shortId }, { $inc: { clicks: 1 } });
    return { rows: [], rowCount: 1 };
  }

  if (normalizedText.includes('users') && normalizedText.includes('favorites =')) {
    const id = params?.[params.length - 1];
    const favorites = params?.[0];
    // Handle both stringified and object favorites
    const favoritesData = typeof favorites === 'string' ? JSON.parse(favorites) : favorites;
    await User.findByIdAndUpdate(id, { favorites: favoritesData });
    return { rows: [], rowCount: 1 };
  }

  if (normalizedText.includes('where id =')) {
    const id = params?.[params.length - 1];

    if (normalizedText.includes('issues')) {
      const updateData: any = { updated_at: new Date() };
      await Issue.findByIdAndUpdate(id, updateData);
      const updated = await Issue.findById(id).lean();
      return { rows: updated ? [convertId(updated)] : [], rowCount: updated ? 1 : 0 };
    }

    if (normalizedText.includes('sprints')) {
      await Sprint.findByIdAndUpdate(id, { updated_at: new Date() });
      const updated = await Sprint.findById(id).lean();
      return { rows: updated ? [convertId(updated)] : [], rowCount: updated ? 1 : 0 };
    }

    if (normalizedText.includes('terminal_sessions')) {
      const updateData: any = { updated_at: new Date() };
      await TerminalSession.findByIdAndUpdate(id, updateData);
      const updated = await TerminalSession.findById(id).lean();
      return { rows: updated ? [convertId(updated)] : [], rowCount: updated ? 1 : 0 };
    }
  }

  console.warn(`Unhandled UPDATE query: ${text.substring(0, 100)}`);
  return { rows: [], rowCount: 0 };
}

async function handleDelete(text: string, params?: any[]): Promise<{ rows: any[]; rowCount: number }> {
  const normalizedText = text.toLowerCase();
  const id = params?.[0];

  if (normalizedText.includes('from pastes')) {
    if (normalizedText.includes('where paste_id =')) {
      const result = await Paste.deleteOne({ paste_id: id });
      return { rows: [], rowCount: result.deletedCount || 0 };
    }
    const result = await Paste.deleteOne({ _id: id });
    return { rows: [], rowCount: result.deletedCount || 0 };
  }

  if (normalizedText.includes('from shortened_urls')) {
    const result = await ShortenedUrl.deleteOne({ _id: id });
    return { rows: [], rowCount: result.deletedCount || 0 };
  }

  if (normalizedText.includes('from terminal_sessions')) {
    const result = await TerminalSession.deleteOne({ _id: id });
    return { rows: [], rowCount: result.deletedCount || 0 };
  }

  if (normalizedText.includes('from terminal_commands')) {
    const result = await TerminalCommand.deleteOne({ _id: id });
    return { rows: [], rowCount: result.deletedCount || 0 };
  }

  if (normalizedText.includes('from sprints')) {
    const result = await Sprint.deleteOne({ _id: id });
    return { rows: [], rowCount: result.deletedCount || 0 };
  }

  if (normalizedText.includes('from issues')) {
    const result = await Issue.deleteOne({ _id: id });
    return { rows: [], rowCount: result.deletedCount || 0 };
  }

  if (normalizedText.includes('from issue_comments')) {
    const result = await IssueComment.deleteOne({ _id: id });
    return { rows: [], rowCount: result.deletedCount || 0 };
  }

  if (normalizedText.includes('from issue_history')) {
    const result = await IssueHistory.deleteOne({ _id: id });
    return { rows: [], rowCount: result.deletedCount || 0 };
  }

  if (normalizedText.includes('where expires_at <')) {
    const result = await Paste.deleteMany({ expires_at: { $lt: new Date() } });
    return { rows: [], rowCount: result.deletedCount || 0 };
  }

  console.warn(`Unhandled DELETE query: ${text.substring(0, 100)}`);
  return { rows: [], rowCount: 0 };
}

function convertId(doc: any): any {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
}

export const getClient = async () => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB not connected');
  }
  return {
    query: async (text: string, params?: any[]) => query(text, params),
    release: () => {}
  };
};

export const pool = { query: async (text: string, params?: any[]) => query(text, params) };

export { User, Paste, ShortenedUrl, TerminalSession, TerminalCommand, Sprint, Issue, IssueComment, IssueHistory, UserHistory };

export default pool;
