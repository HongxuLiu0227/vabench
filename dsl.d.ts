// Tree-Centric DSL for AI-Assisted Design System
// Each node contains all relevant properties for that level of the hierarchy

interface ProjectFSNode {
  // Core Identity
  id: string;
  type: NodeType;
  name: string;
  
  // Hierarchical Structure
  parent?: ProjectFSNode;
  children: ProjectFSNode[];
  depth: number;
  path: string; // e.g., "src/pages/home.tsx"
  
  // === NODE-LEVEL PROPERTIES ===
  
  // Component/Element Properties
  component: ComponentProperties;
  
  // AI Understanding & Analysis
  ai: AINodeAnalysis;
  
  // Interaction & Selection State
  interaction: InteractionState;
  
  // Change Tracking & History
  changes: ChangeTrackingState;
  
  // Workflow & Progress
  workflow: WorkflowNodeState;
  
  // Privacy & Security
  privacy: PrivacyNodeSettings;
  
  // Quality & Validation
  quality: QualityNodeMetrics;
}

type NodeType = 
  | 'root'           // The entire project
  | 'folder'         // A single folder
  | 'page'           // A single page/screen
  | 'layout'         // Layout containers (header, sidebar, main, footer)
  | 'section'        // Content sections
  | 'component'      // Reusable components
  | 'element'        // Individual UI elements
  | 'text'           // Text content
  | 'media'          // Images, videos, etc.
  | 'interactive'    // Buttons, inputs, forms
  | 'navigation'     // Menus, links, breadcrumbs
  | 'data'           // Charts, tables, lists
  | 'custom';        // User-defined components

// === SPATIAL PROPERTIES ===
interface SpatialProperties {
  // Position and dimensions
  boundingBox: BoundingBox;
  zIndex: number;
  
  // Layout relationships
  layoutType: 'fixed' | 'flex' | 'grid' | 'absolute' | 'relative';
  layoutProps: LayoutProperties;
  
  // Selection and highlighting
  isSelected: boolean;
  isHighlighted: boolean;
  highlightStyle: HighlightStyle;
  
  // Spatial queries - find related nodes
  spatialRelationships: SpatialRelationship[];
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
}

interface SpatialRelationship {
  relatedNodeId: string;
  relationship: 'contains' | 'contained-by' | 'adjacent' | 'overlaps' | 'aligned';
  confidence: number;
}

interface LayoutProperties {
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gridTemplate?: string;
  gap?: number;
  padding?: Spacing;
  margin?: Spacing;
}

interface Spacing {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Highlight style
interface HighlightStyle {
  color: string;
  opacity: number;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  animation?: 'pulse' | 'fade' | 'none';
}

// === COMPONENT PROPERTIES ===
interface ComponentProperties {
  // Basic properties
  tagName?: string; // HTML tag, React component name, etc.
  className?: string[];
  attributes: Record<string, any>;
  
  // Styling
  styles: StyleDefinition;
  
  // Content
  content: ContentDefinition;
  
  // Behavior and state
  behavior: BehaviorDefinition;
  
  // Framework-specific properties
  framework: FrameworkProperties;
  
  // Visual & Spatial Properties
  spatial: SpatialProperties;
}

interface StyleDefinition {
  css: CSSProperties;
  theme: ThemeVariables;
  responsive: ResponsiveBreakpoints;
  animations: AnimationDefinition[];
}

// CSS properties
interface CSSProperties {
  [key: string]: string | number;
}

// Theme variables
interface ThemeVariables {
  colors: Record<string, string>;
  spacing: Record<string, string>;
  typography: Record<string, string>;
  breakpoints: Record<string, string>;
}

// Responsive breakpoints
interface ResponsiveBreakpoints {
  mobile: string;
  tablet: string;
  desktop: string;
  wide: string;
}

// Animation definition
interface AnimationDefinition {
  name: string;
  duration: number;
  easing: string;
  keyframes: Record<string, any>;
}

interface ContentDefinition {
  text?: string;
  html?: string;
  imageUrl?: string;
  iconName?: string;
  dataSource?: string;
  placeholder?: string;
}

interface BehaviorDefinition {
  events: EventHandler[];
  state: ComponentState;
  props: PropDefinition[];
  lifecycle: LifecycleHooks;
}

// Event handler
interface EventHandler {
  event: string;
  handler: string;
  preventDefault?: boolean;
  stopPropagation?: boolean;
}

// Component state
interface ComponentState {
  isVisible: boolean;
  isEnabled: boolean;
  isLoading: boolean;
  hasError: boolean;
  customStates: Record<string, any>;
}

// Property definition
interface PropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function';
  required: boolean;
  defaultValue?: any;
  description: string;
}

// Lifecycle hooks
interface LifecycleHooks {
  onMount?: string;
  onUnmount?: string;
  onUpdate?: string;
  onError?: string;
}

interface FrameworkProperties {
  react?: ReactProperties;
  vue?: VueProperties;
  angular?: AngularProperties;
  html?: HTMLProperties;
}

// React properties
interface ReactProperties {
  hooks: string[];
  context: string[];
  memoized: boolean;
}

// Vue properties
interface VueProperties {
  computed: string[];
  watchers: string[];
  directives: string[];
}

// Angular properties
interface AngularProperties {
  inputs: string[];
  outputs: string[];
  services: string[];
}

// HTML properties
interface HTMLProperties {
  semantic: boolean;
  aria: Record<string, string>;
  dataAttributes: Record<string, string>;
}

// === AI NODE ANALYSIS ===
interface AINodeAnalysis {
  // Detection and recognition
  detection: NodeDetectionResult;
  
  // Understanding and classification
  understanding: NodeUnderstanding;
  
  // Relationships to other nodes
  relationships: NodeRelationships;
  
  // Modification suggestions
  suggestions: NodeSuggestions;
  
  // Similar nodes in the tree
  similarities: SimilarNodeAnalysis;
  
  // Questions and clarifications needed
  clarifications: ClarificationQuery[];
}

interface NodeDetectionResult {
  confidence: number;
  detectedType: NodeType;
  alternativeTypes: Array<{type: NodeType; confidence: number}>;
  visualFeatures: VisualFeature[];
  detectionMethod: 'image-analysis' | 'user-input' | 'inferred';
  timestamp: Date;
}

interface NodeUnderstanding {
  purpose: string;
  functionality: string[];
  userGoals: string[];
  designPatterns: string[];
  accessibility: AccessibilityAnalysis;
  semantics: SemanticAnalysis;
}

interface NodeRelationships {
  dependsOn: string[]; // Node IDs this node depends on
  affects: string[]; // Node IDs affected by this node
  similarTo: string[]; // Nodes with similar function/appearance
  groupedWith: string[]; // Nodes that form a logical group
  layoutRelated: string[]; // Nodes related by layout
}

interface NodeSuggestions {
  improvements: ImprovementSuggestion[];
  optimizations: OptimizationSuggestion[];
  alternatives: AlternativeSuggestion[];
  nextSteps: NextStepSuggestion[];
}

interface SimilarNodeAnalysis {
  similarNodes: Array<{
    nodeId: string;
    similarityScore: number;
    similarityReasons: string[];
    suggestBulkOperation: boolean;
  }>;
  groupModificationSuggestion?: GroupModificationPlan;
}

interface ClarificationQuery {
  id: string;
  question: string;
  priority: 'high' | 'medium' | 'low';
  context: string;
  suggestedAnswers?: string[];
  affectsNodes: string[];
}

// === INTERACTION STATE ===
interface InteractionState {
  // Selection and focus
  selection: SelectionState;
  
  // Voice interaction
  voice: VoiceInteractionState;
  
  // Mouse/touch interaction
  pointing: PointingInteractionState;
  
  // System commands
  commands: CommandInteractionState;
  
  // Multi-modal input
  multiModal: MultiModalState;
}

interface SelectionState {
  isSelected: boolean;
  selectionMethod: 'mouse' | 'voice' | 'keyboard' | 'ai-suggestion';
  selectionTime: Date;
  selectionContext: string;
  groupSelection: string[]; // Other selected node IDs
}

interface VoiceInteractionState {
  isListening: boolean;
  lastVoiceCommand: string;
  voiceContext: string;
  confidence: number;
  emotionalTone: EmotionalTone;
  preferredVoiceCommands: string[];
}

// Emotional tone
interface EmotionalTone {
  type: 'happy' | 'sad' | 'angry' | 'frustrated' | 'excited' | 'confused' | 'confident' | 'anxious' | 'neutral';
  intensity: number; // 1-10
  confidence: number; // 0-1
  responseStrategy: 'encourage' | 'guide' | 'celebrate' | 'comfort' | 'motivate';
  context: {
    currentTask: string;
    userProgress: number; // 0-100
    errorCount: number;
  };
}

interface PointingInteractionState {
  isHovered: boolean;
  lastClick: ClickInfo;
  dragState: DragState;
  gestureHistory: GestureEvent[];
}

// Click information
interface ClickInfo {
  timestamp: Date;
  position: { x: number; y: number };
  button: 'left' | 'right' | 'middle';
  clickCount: number;
  targetNodeId: string;
  modifiers: {
    ctrl: boolean;
    shift: boolean;
    alt: boolean;
    meta: boolean;
  };
}

// Drag state
interface DragState {
  isDragging: boolean;
  startPosition: { x: number; y: number };
  currentPosition: { x: number; y: number };
  draggedNodeId: string;
  dropTargetId?: string;
  dragType: 'move' | 'copy' | 'resize';
}

// Gesture event
interface GestureEvent {
  type: 'pinch' | 'swipe' | 'rotate' | 'long-press';
  timestamp: Date;
  position: { x: number; y: number };
  data: {
    scale?: number;
    rotation?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    duration?: number;
  };
}

// Command interaction state
interface CommandInteractionState {
  lastCommand: CommandInfo;
  commandHistory: CommandInfo[];
  availableCommands: AvailableCommand[];
  commandContext: CommandContext;
}

// Command information
interface CommandInfo {
  id: string;
  name: string;
  timestamp: Date;
  parameters: Record<string, any>;
  result: CommandResult;
  executionTime: number;
}

// Available command
interface AvailableCommand {
  name: string;
  description: string;
  category: 'navigation' | 'modification' | 'export' | 'system';
  shortcuts: string[];
  requiresConfirmation: boolean;
  permissions: string[];
}

// Command context
interface CommandContext {
  currentMode: 'edit' | 'view' | 'debug';
  activeTool: string;
  selectedNodes: string[];
  clipboard: ClipboardData;
  undoStack: CommandInfo[];
  redoStack: CommandInfo[];
}

// Command result
interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
  errors: string[];
  warnings: string[];
}

// Clipboard data
interface ClipboardData {
  type: 'text' | 'component' | 'style' | 'mixed';
  content: any;
  sourceNodeId?: string;
  timestamp: Date;
}

interface MultiModalState {
  activeModalities: ('voice' | 'mouse' | 'keyboard' | 'touch')[];
  contextSwitching: boolean;
  preferredModality: string;
}

// === CHANGE TRACKING STATE ===
interface ChangeTrackingState {
  // Version history for this node
  versions: NodeVersionHistory;
  
  // Current change state
  current: NodeChangeState;
  
  // Change visualization
  visualization: ChangeVisualization;
  
  // Impact analysis
  impact: ChangeImpactAnalysis;
}

interface NodeVersionHistory {
  versions: NodeVersion[];
  maxVersions: number;
  currentVersionId: string;
  canRollback: boolean;
}

interface NodeVersion {
  id: string;
  timestamp: Date;
  description: string;
  changes: NodeChange[];
  snapshot: NodeSnapshot;
  userAction: string;
  aiReasoning: string;
}

// Node change
interface NodeChange {
  type: ModificationType;
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

// Node snapshot
interface NodeSnapshot {
  nodeId: string;
  timestamp: Date;
  data: Partial<ProjectFSNode>;
  metadata: {
    version: string;
    framework: string;
    createdBy: string;
  };
}

// Pending change
interface PendingChange {
  id: string;
  type: ModificationType;
  description: string;
  parameters: Record<string, any>;
  requiresApproval: boolean;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: {
    affectedNodes: string[];
    riskLevel: 'low' | 'medium' | 'high';
    timeEstimate: number; // minutes
  };
}

interface NodeChangeState {
  isModified: boolean;
  modificationTime: Date;
  modificationType: ModificationType[];
  pendingChanges: PendingChange[];
  needsUserReview: boolean;
}

type ModificationType = 
  | 'created' | 'deleted' | 'moved' | 'resized' | 'styled' 
  | 'content-changed' | 'behavior-added' | 'restructured' | 'properties-changed';

interface ChangeVisualization {
  shouldHighlight: boolean;
  highlightType: ModificationType;
  highlightDuration: number;
  highlightStyle: HighlightStyle;
  showDiff: boolean;
  diffView: DiffVisualization;
}

// Diff visualization
interface DiffVisualization {
  type: 'unified' | 'split' | 'inline';
  showLineNumbers: boolean;
  highlightChanges: boolean;
  contextLines: number;
  changes: DiffChange[];
  summary: {
    added: number;
    removed: number;
    modified: number;
    total: number;
  };
}

// Diff change
interface DiffChange {
  type: 'added' | 'removed' | 'modified';
  lineNumber: number;
  oldContent: string;
  newContent: string;
  nodeId: string;
  field: string;
}

interface ChangeImpactAnalysis {
  affectedNodes: string[];
  potentialIssues: string[];
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

// === WORKFLOW NODE STATE ===
interface WorkflowNodeState {
  // Current workflow phase for this node
  phase: WorkflowPhase;
  
  // Progress tracking
  progress: NodeProgressState;
  
  // User guidance
  guidance: NodeGuidanceState;
  
  // Emotional support context
  emotional: NodeEmotionalState;
  
  // Knowledge checking
  knowledge: NodeKnowledgeState;
}

type WorkflowPhase = 
  | 'analyzing' | 'clarifying' | 'planning' | 'generating' 
  | 'modifying' | 'reviewing' | 'testing' | 'complete';

interface NodeProgressState {
  currentStep: string;
  completedSteps: string[];
  nextSteps: string[];
  estimatedCompletion: number; // percentage
  blockers: string[];
}

interface NodeGuidanceState {
  needsHelp: boolean;
  helpType: 'tutorial' | 'clarification' | 'troubleshooting';
  activeHelp: HelpContext;
  userExpertise: 'beginner' | 'intermediate' | 'advanced';
}

// Help context
interface HelpContext {
  topic: string;
  content: string;
  examples: string[];
  relatedTopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // minutes
  interactive: boolean;
  progress: {
    currentStep: number;
    totalSteps: number;
    completedSteps: string[];
  };
}

interface NodeEmotionalState {
  userSentiment: 'frustrated' | 'confused' | 'confident' | 'excited' | 'neutral';
  successfulOperations: number;
  failedOperations: number;
  needsEncouragement: boolean;
  lastSupportMessage: string;
}

interface NodeKnowledgeState {
  activeQuestions: KnowledgeQuestion[];
  understandingLevel: number; // 1-10
  conceptsToReview: string[];
  knowledgeGaps: string[];
}

// Knowledge question
interface KnowledgeQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'concept' | 'operation' | 'troubleshooting';
  relatedConcepts: string[];
  userAnswer?: string;
  isCorrect?: boolean;
  timeSpent?: number; // seconds
}

// === PRIVACY NODE SETTINGS ===
interface PrivacyNodeSettings {
  sensitivityLevel: 'public' | 'internal' | 'confidential' | 'restricted';
  dataTypes: SensitiveDataType[];
  protectionMethods: ProtectionMethod[];
  inheritFromParent: boolean;
  customRules: PrivacyRule[];
}

type SensitiveDataType = 'personal' | 'financial' | 'medical' | 'proprietary' | 'user-content';
type ProtectionMethod = 'mask' | 'encrypt' | 'exclude' | 'anonymize';

interface PrivacyRule {
  condition: string;
  action: ProtectionMethod;
  scope: 'this-node' | 'children' | 'subtree';
}

// === QUALITY NODE METRICS ===
interface QualityNodeMetrics {
  scores: QualityScores;
  checks: QualityCheck[];
  recommendations: QualityRecommendation[];
  compliance: ComplianceStatus;
}

interface QualityScores {
  overall: number;
  accessibility: number;
  performance: number;
  usability: number;
  maintainability: number;
  design: number;
}

interface QualityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  fixSuggestion?: string;
  automated: boolean;
}

// Quality recommendation
interface QualityRecommendation {
  category: 'accessibility' | 'performance' | 'usability' | 'maintainability';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'easy' | 'medium' | 'hard';
  automated: boolean;
  priority: number; // 1-10
  implementation: {
    steps: string[];
    codeExample?: string;
    estimatedTime: number; // minutes
  };
}

// Compliance status
interface ComplianceStatus {
  wcag: 'compliant' | 'non-compliant' | 'partially-compliant';
  gdpr: 'compliant' | 'non-compliant' | 'not-applicable';
  accessibility: number; // 0-100
  security: number; // 0-100
  lastAudit: Date;
  issues: ComplianceIssue[];
  recommendations: string[];
}

// Compliance issue
interface ComplianceIssue {
  type: 'accessibility' | 'security' | 'privacy' | 'legal';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  affectedNodes: string[];
  fixRequired: boolean;
  deadline?: Date;
}

// === TREE OPERATIONS ===
interface TreeOperations {
  // Navigation
  findNode(id: string): ProjectFSNode | null;
  findNodesByType(type: NodeType): ProjectFSNode[];
  getPath(nodeId: string): string;
  getAncestors(nodeId: string): ProjectFSNode[];
  getDescendants(nodeId: string): ProjectFSNode[];
  getSiblings(nodeId: string): ProjectFSNode[];
  
  // Spatial queries
  findNodesInRegion(region: BoundingBox): ProjectFSNode[];
  findNearbyNodes(nodeId: string, radius: number): ProjectFSNode[];
  findSimilarNodes(nodeId: string): ProjectFSNode[];
  
  // Modification operations
  addNode(parent: string, node: ProjectFSNode): void;
  removeNode(nodeId: string): void;
  moveNode(nodeId: string, newParent: string): void;
  duplicateNode(nodeId: string): ProjectFSNode;
  
  // Bulk operations
  applyToSimilarNodes(nodeId: string, operation: NodeOperation): void;
  bulkModify(nodeIds: string[], operation: NodeOperation): void;
  
  // Version operations
  createCheckpoint(description: string): string;
  rollbackToVersion(versionId: string): void;
  compareVersions(versionA: string, versionB: string): VersionDiff;
}

interface NodeOperation {
  type: ModificationType;
  parameters: Record<string, any>;
  validate?: (node: ProjectFSNode) => boolean;
  preview?: boolean;
}

// === ROOT PROJECT CONTAINER ===
interface Project {
  metadata: ProjectMetadata;
  root: ProjectFSNode;
  operations: TreeOperations;
  globalState: GlobalProjectState;
}

interface ProjectMetadata {
  id: string;
  name: string;
  created: Date;
  lastModified: Date;
  framework: 'react' | 'vue' | 'angular' | 'html' | 'flutter' | 'swift-ui';
  version: string;
}

interface GlobalProjectState {
  activeSelections: string[];
  workflowPhase: WorkflowPhase;
  aiContext: GlobalAIContext;
  userPreferences: UserPreferences;
  systemSettings: SystemSettings;
}

// Export main interfaces
export {
  ProjectFSNode as ProjectNode,
  TreeOperations,
  Project,
  NodeType,
  SpatialProperties,
  AINodeAnalysis,
  InteractionState,
  ChangeTrackingState,
  WorkflowNodeState
};