namespace DairyDemo.Auth.UI.Controls;

public class CaptchaPuzzleControl : UserControl
{
    private readonly PictureBox[] _boxes = new PictureBox[4];
    private readonly int[] _order = [0, 1, 2, 3];
    private List<Image> _images = [];
    private int? _selectedIndex;

    public bool IsSolved => _images.Count == _boxes.Length && _order.AsSpan().SequenceEqual([0, 1, 2, 3]);

    public CaptchaPuzzleControl()
    {
        Width = 220;
        Height = 220;

        var table = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            RowCount = 2,
            ColumnCount = 2,
        };
        for (var index = 0; index < 2; index++)
        {
            table.RowStyles.Add(new RowStyle(SizeType.Percent, 50));
            table.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 50));
        }

        for (var index = 0; index < _boxes.Length; index++)
        {
            var box = new PictureBox
            {
                Dock = DockStyle.Fill,
                SizeMode = PictureBoxSizeMode.StretchImage,
                BorderStyle = BorderStyle.FixedSingle,
            };
            box.MouseDown += OnTileMouseDown;
            _boxes[index] = box;
            table.Controls.Add(box, index % 2, index / 2);
        }

        Controls.Add(table);
    }

    public void LoadFromFolder(string folderPath)
    {
        var loaded = new List<Image>(_boxes.Length);
        try
        {
            for (var index = 1; index <= _boxes.Length; index++)
            {
                using var original = Image.FromFile(Path.Combine(folderPath, $"{index}.png"));
                loaded.Add(new Bitmap(original));
            }
        }
        catch
        {
            foreach (var image in loaded)
                image.Dispose();
            throw;
        }

        ReleaseImages();
        _images = loaded;
        Shuffle();
    }

    public void Shuffle()
    {
        if (_images.Count != _boxes.Length)
            return;

        do
        {
            Random.Shared.Shuffle(_order);
        } while (IsSolved);

        _selectedIndex = null;
        RenderOrder();
    }

    private void OnTileMouseDown(object? sender, MouseEventArgs e)
    {
        if (e.Button != MouseButtons.Left || sender is not PictureBox box || _images.Count != _boxes.Length)
            return;

        var index = Array.IndexOf(_boxes, box);
        if (_selectedIndex is { } previous)
        {
            (_order[previous], _order[index]) = (_order[index], _order[previous]);
            _selectedIndex = null;
        }
        else
        {
            _selectedIndex = index;
        }

        RenderOrder();
    }

    private void RenderOrder()
    {
        // При обмене фрагментов меняется порядок уже загруженных изображений.
        for (var index = 0; index < _boxes.Length; index++)
        {
            _boxes[index].Image = _images[_order[index]];
            _boxes[index].BorderStyle = index == _selectedIndex ? BorderStyle.Fixed3D : BorderStyle.FixedSingle;
        }
    }

    private void ReleaseImages()
    {
        foreach (var box in _boxes)
            box.Image = null;
        foreach (var image in _images)
            image.Dispose();
        _images.Clear();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            ReleaseImages();
        base.Dispose(disposing);
    }
}
