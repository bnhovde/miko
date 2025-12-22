# Architecture Refactor Notes

## Completed (Phases 1-3)

### Phase 1: Core Data Layer ✅
- Created `SpriteData` class - proper data structure instead of string manipulation
- Created `SheetData` class - manages sprite sheet grids
- Created Repository pattern with migration support
- Added `pixelOperations.ts` with pure utility functions

**New Files:**
- `src/core/SpriteData.ts`
- `src/core/SheetData.ts`
- `src/repositories/SpriteRepository.ts`
- `src/repositories/SheetRepository.ts`
- `src/repositories/migrations.ts`
- `src/utils/pixelOperations.ts`

### Phase 2: State Management ✅
- Installed Zustand
- Replaced massive EditorContext (500+ lines) with 3 focused stores
- Much simpler state management

**New Files:**
- `src/stores/useSpriteStore.ts` - sprite editing state
- `src/stores/useSheetStore.ts` - sheet editing state
- `src/stores/useEditorStore.ts` - UI state only

### Phase 3: Custom Hooks ✅
- Extracted business logic into focused hooks
- Updated simple components to use new stores

**New Files:**
- `src/hooks/useCanvasDraw.ts`
- `src/hooks/useFrameManager.ts`
- `src/hooks/usePaletteManager.ts`
- `src/hooks/useSheetManager.ts`

**Updated Components:**
- `components/ToolPicker/ToolPicker.tsx` - uses useEditorStore
- `components/ToolPickerSheet/ToolPickerSheet.tsx` - uses stores + hooks
- `components/SheetControls/SheetControls.tsx` - uses useEditorStore

## Remaining Work

### Critical: Main Components Need Migration
The core Canvas components still use the old EditorContext:
- `components/Canvas/Canvas.tsx` - needs useCanvasDraw hook
- `components/CanvasSheet/CanvasSheet.tsx` - needs useSheetManager
- `components/Timeline/` - needs useFrameManager
- `components/ColorPicker/ColorPicker.tsx` - needs usePaletteManager
- `components/SpritePicker/SpritePicker.tsx` - needs migration
- Page components in `pages/app/editor/` - need to load data from repositories

### Phase 4: File Reorganization (Optional)
Could move to features-based structure, but not critical for a hobby project.

### Phase 5: Cleanup
- Delete `context/EditorContext.tsx` once all components migrated
- Remove unused hash utility functions
- Add memoization where needed

## Migration Strategy for Remaining Components

### Canvas.tsx Pattern:
```typescript
import { useCanvasDraw } from '../../src/hooks/useCanvasDraw';
import { useSpriteStore } from '../../src/stores/useSpriteStore';

const Canvas: React.FC = () => {
  const { currentSprite, unsavedFrameData, currentFrame } = useSpriteStore();
  const { handlePixelClick, handleDrawEnd } = useCanvasDraw();
  
  // Use SpriteData for rendering
  const frameHash = currentSprite?.frames[currentFrame];
  const frameData = unsavedFrameData || (frameHash && SpriteData.fromHash(...));
  const colors = frameData?.toColorArray() || [];
  
  return (
    // render pixels using colors array
  );
};
```

### Page Component Pattern:
```typescript
import { spriteRepository } from '../../src/repositories/SpriteRepository';
import { useSpriteStore } from '../../src/stores/useSpriteStore';

const SpritePage = () => {
  const { loadSprite } = useSpriteStore();
  
  useEffect(() => {
    const loadData = async () => {
      const sprite = await spriteRepository.load(id);
      if (sprite) loadSprite(sprite);
    };
    loadData();
  }, [id]);
  
  return <Editor />;
};
```

## Benefits Achieved

1. **Simpler State**: Zustand stores are 1/10th the code of EditorContext
2. **Type Safety**: Proper data classes instead of string manipulation
3. **Testability**: Pure functions in pixelOperations.ts
4. **Maintainability**: Clear separation of concerns
5. **Migration Support**: Versioned data with automatic upgrades

## Next Steps

1. Migrate Canvas.tsx (most critical - the drawing interface)
2. Migrate page components to use repositories
3. Migrate ColorPicker and Timeline
4. Delete EditorContext
5. Test everything works end-to-end

